import { mkdir, readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { join } from 'path/posix'
import { currentConfig, loadConfigFile } from '~/core/config.ts'
import { OceanPress } from '~/core/ocean_press.ts'
import { program } from './common.ts'

program
  .command('build')
  .description('输出静态站点源码')
  .option('-c, --config <string>', '指定配置文件的位置')
  .option('-o, --output <string>', '指定输出目录位置')
  .action(async (opt: { config: string; output: string }) => {
    if (!opt.config || !opt.output) {
      console.log(`请设置配置文件位置和输出目录位置`)
      throw new Error('请设置配置文件位置和输出目录位置')
    }
    const config = await readFile(opt.config, 'utf-8')
    loadConfigFile(JSON.parse(config))
    const filePath = resolve(opt.output)
    const ocean_press = new OceanPress(currentConfig.value)

    // node 端写磁盘插件
    ocean_press.pluginCenter.registerPlugin({
      async build_onFileTree([tree]) {
        for (const [path, data] of Object.entries(tree)) {
          const fullPath = join(filePath, './', path)
          const pathArray = fullPath.split('/').slice(0, -1)
          const dirPath = pathArray.join('/')
          mkdir(dirPath, { recursive: true })
          try {
            if (typeof data === 'string') {
              await writeFile(fullPath, data, 'utf-8')
            } else {
              await writeFile(fullPath, new DataView(data))
            }
          } catch (error) {
            console.log(`${fullPath} 无法写入`)
          }
        }
      },
    })

    await ocean_press.build({
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
    })
  })
