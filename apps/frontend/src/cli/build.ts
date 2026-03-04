import { mkdir, readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { join } from 'path/posix'
import { currentConfig, loadConfigFile } from '~/core/config.ts'
import { OceanPress } from '~/core/ocean_press.ts'
import { program } from './common.ts'
import { Context, Effect } from 'effect'
import {
  EffectRender,
  EffectLocalStorageDep,
  EffectLogDep,
  EffectConfigDep,
} from '~/core/EffectDep.ts'
import { renderApiDep } from '~/core/render.api.dep.ts'
import { nodeApiDep } from '~/util/store.node.dep.ts'

program
  .command('build')
  .description('输出静态站点源码')
  .option('-c, --config <string>', '指定配置文件的位置')
  .option('-o, --output <string>', '指定输出目录位置')
  .option('--md', '启用 Markdown 镜像导出模式')
  .option('--watch', '启用监听模式，定时自动重新构建')
  .option('--watch-interval <number>', '监听模式下的同步间隔（秒）', '60')
  .action(async (opt: { config: string; output: string; md?: boolean; watch?: boolean; watchInterval?: string }) => {
    if (!opt.config || !opt.output) {
      console.log(`请设置配置文件位置和输出目录位置`)
      throw new Error('请设置配置文件位置和输出目录位置')
    }
    const config = await readFile(opt.config, 'utf-8')
    const filePath = resolve(opt.output)

    let parsedConfig
    try {
      parsedConfig = JSON.parse(config)
    } catch (error) {
      console.error('配置文件解析失败:', error)
      throw new Error('配置文件格式错误')
    }

    /** 如果启用了 --md 参数，自动添加 MarkdownMirror 插件配置 */
    if (opt.md) {
      const currentProfileName = parsedConfig.__current__
      const currentProfile = parsedConfig[currentProfileName]

      if (currentProfile) {
        // 保留用户现有的配置，只设置缺失的默认值
        currentProfile.markdownMirror = {
          enable: true,  // --md 参数强制启用
          includeAssets: currentProfile.markdownMirror?.includeAssets ?? false,  // 默认不同步资源
        }
        console.log('✅ 已启用 Markdown 镜像导出模式\n')
      }
    }

    /** 先加载配置 */
    await Effect.runPromise(
      Effect.provideService(
        loadConfigFile(parsedConfig),
        EffectLocalStorageDep,
        nodeApiDep,
      ),
    )

    const context = Context.empty().pipe(
      Context.add(EffectRender, renderApiDep),
      Context.add(EffectLocalStorageDep, nodeApiDep),
      Context.add(EffectConfigDep, currentConfig.value),
      Context.add(EffectLogDep, {
        log: (msg) => {
          if (msg.startsWith('渲染：')) {
            process.stdout.write(`\r\x1b[K${msg}`)
          } else {
            process.stdout.write(`\n${msg}`)
          }
        },
        percentage: (n) => {
          process.stdout.write(`\r\x1b[K进度：${n}%`)
        },
      }),
    )

    /** 执行构建 */
    const runBuild = async () => {
      const p = Effect.provide(
        Effect.gen(function* () {
          const ocean_press = new OceanPress(currentConfig.value)

          // node 端写磁盘插件
          ocean_press.pluginCenter.registerPlugin({
            async build_onFileTree([tree]) {
              const dirPromises = new Set<string>()

              for (const [path, data] of Object.entries(tree)) {
                const fullPath = join(filePath, path)
                const dirPath = resolve(fullPath, '..')

                // 避免重复创建目录
                if (!dirPromises.has(dirPath)) {
                  dirPromises.add(dirPath)
                  await mkdir(dirPath, { recursive: true })
                }

                try {
                  if (typeof data === 'string') {
                    await writeFile(fullPath, data, 'utf-8')
                  } else {
                    await writeFile(fullPath, new DataView(data))
                  }
                } catch (error) {
                  console.error(`${fullPath} 无法写入:`, error)
                }
              }
            },
          })

          console.log('[config.__current__]', parsedConfig.__current__)
          console.log('[currentConfig.value.name]', currentConfig.value.name)
          return yield* ocean_press.build()
        }),
        context,
      )
      await Effect.runPromise(p)
    }

    // 如果是 watch 模式，定时执行构建
    if (opt.watch) {
      const intervalSeconds = parseInt(opt.watchInterval || '60', 10)
      const intervalMs = intervalSeconds * 1000
      console.log(`\n🔄 监听模式已启动，每 ${intervalSeconds} 秒自动构建一次\n`)

      // 立即执行第一次构建
      await runBuild()

      // 定时执行构建
      setInterval(async () => {
        console.log('\n⏰ 定时任务触发，开始构建...')
        try {
          await runBuild()
          const nextTime = new Date(Date.now() + intervalMs).toLocaleTimeString()
          console.log(`\n⏰ 下次构建: ${nextTime}\n`)
        } catch (error) {
          console.error('❌ 构建失败:', error)
        }
      }, intervalMs)
    } else {
      // 单次构建
      await runBuild()
    }
  })
