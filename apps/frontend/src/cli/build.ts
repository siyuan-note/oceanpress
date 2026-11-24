import { cp, mkdir, readdir, readFile, stat, unlink, writeFile } from 'fs/promises'
import { dirname, join, resolve, relative, sep } from 'path'
import { fileURLToPath } from 'url'
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

/** 随包发布的运行时资源（样式、高亮、公式、图表库等）所在的子目录 */
const NOTEBOOK_ASSET_DIRS = ['appearance', 'stage', 'assets']

/** 从本文件所在目录逐级向上查找 public/notebook，源码运行与打包后的 cli 都能定位到 */
async function findNotebookDir() {
  let dir = dirname(fileURLToPath(import.meta.url))
  for (const _ of [0, 1, 2, 3]) {
    const candidate = join(dir, 'public', 'notebook')
    const found = await stat(candidate).then(
      (s) => s.isDirectory(),
      () => false,
    )
    if (found) return candidate
    dir = resolve(dir, '..')
  }
  throw new Error('未找到运行时资源目录 public/notebook')
}

/** 把运行时资源复制到产物的 notebook/ 下，让产物目录自成一体；资源前缀指向外部地址时无需复制 */
async function copyNotebookAssets(outputDir: string, prefix: string | undefined) {
  if (prefix && /^https?:\/\//.test(prefix)) return
  const notebookDir = await findNotebookDir()
  const target = resolve(outputDir, 'notebook')
  await mkdir(target, { recursive: true })
  await Promise.all(
    NOTEBOOK_ASSET_DIRS.map((dir) =>
      cp(join(notebookDir, dir), join(target, dir), {
        recursive: true,
        force: true,
        preserveTimestamps: true,
      }),
    ),
  )
}

program
  .command('build')
  .description('输出静态站点源码')
  .option('-c, --config <string>', '指定配置文件的位置')
  .option('-o, --output <string>', '指定输出目录位置')
  .option('--md', '启用 Markdown 镜像导出模式')
  .option('--watch', '启用监听模式，定时自动重新构建')
  .option('--watch-interval <number>', '监听模式下的同步间隔（秒）', '60')
  .option('--no-clean', '不清理输出目录里已不在笔记中的旧页面（默认清理）')
  .action(async (opt: { config: string; output: string; md?: boolean; watch?: boolean; watchInterval?: string; clean?: boolean }) => {
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
              console.log('=== 开始复制运行时资源 ===')
              await copyNotebookAssets(
                filePath,
                currentConfig.value.cdn?.siyuanPrefix,
              )
              const dirPromises = new Set<string>()

              for (const [path, data] of Object.entries(tree)) {
                const fullPath = resolve(filePath, path.replace(/^\/+/, ''))
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
              await cleanStaleHtml(filePath, tree, opt.clean !== false)
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

/** 输出目录里不参与清理的目录：资源、构建元数据、用户自有文件 */
const KEEP_DIRS = new Set(['assets', '__oceanpress', 'notebook'])

/**
 * 删除输出目录中已不在本次产物里的 .html（笔记里被删除/改名的文档留下的旧页面）。
 * 只清理带 OceanPress 生成标记的文件，避免误删用户放在输出目录里的自有页面。
 */
async function cleanStaleHtml(outputDir: string, tree: Record<string, unknown>, enable: boolean) {
  if (!enable) return
  /** tree 的 key 形如 "/关于.html"（带前导斜杠），统一归一化为相对路径再比对 */
  const fresh = new Set(Object.keys(tree).map((k) => k.replace(/^\/+/, '')))
  const stale: string[] = []
  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        /** __oceanpress 目录里只有非 html 产物，旧版本曾在此生成 docTree.html，一并参与清理 */
        if (dir === outputDir && entry.name !== '__oceanpress' && KEEP_DIRS.has(entry.name)) continue
        await walk(full)
      } else if (
        entry.name.endsWith('.html') &&
        !fresh.has(relative(outputDir, full).split(sep).join('/')) &&
        /<meta name="generator" content="OceanPress"/.test(await readFile(full, 'utf-8').catch(() => ''))
      ) {
        stale.push(full)
      }
    }
  }
  await walk(outputDir).catch(() => undefined)
  await Promise.all(stale.map((f) => unlink(f)))
  if (stale.length) console.log(`已清理 ${stale.length} 个已不在笔记中的旧页面`)
}
