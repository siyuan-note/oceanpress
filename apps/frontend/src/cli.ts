import '~/core/render.api.dep'
import '~/util/store.node.dep'
import { Command } from 'commander'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { join } from 'path/posix'
import { currentConfig, loadConfigFile } from './core/config.ts'
import { setCache } from './core/cache.ts'
import { server } from './server.ts'
import { OceanPress } from './core/ocean_press.ts'
import { genZIP } from './core/genZip.ts'
const program = new Command()
console.log(process.argv)

program
  .name('OceanPress')
  .description('这是一款从思源笔记本生成一个静态站点的工具')

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
    const res = await ocean_press.build()
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

    const obj = (await res.next()).value
    if (typeof obj === 'object' && !(obj instanceof Error)) {
      obj.log = (...arg) => {
        console.log(...arg)
      }
    }
    for await (const iterator of res) {
      if (typeof iterator === 'string') {
        if (iterator.startsWith('渲染：')) {
          process.stdout.write(`\r\x1b[K${iterator}`)
        } else {
          process.stdout.write(`\n${iterator}`)
        }
      } else {
        console.log(iterator + '\n')
      }
    }
  })

program
  .command('server')
  .description('启动动态代理')
  .option('-c, --config <string>', '指定配置文件的位置')
  .option('-h, --host <string>', 'web服务绑定到的地址', '127.0.0.1')
  .option('-p, --port <number>', 'web服务绑定到的端口', '80')
  .option(
    '--cache <boolean>',
    '配置为 true 时开启缓存,默认为 false 不开启缓存',
    'false',
  )
  .action(
    async (opt: {
      config: string
      host: string
      port: string
      cache: 'false'
    }) => {
      if (!opt.config) {
        console.log(`请设置配置文件位置`)
      }
      const config = await readFile(opt.config, 'utf-8')
      loadConfigFile(JSON.parse(config))
      setCache(opt.cache !== 'false')
      server({
        hostname: opt.host,
        port: Number(opt.port),
      })
    },
  )

program
  .command('deploy')
  .description('部署站点')
  .option('-c, --config <string>', '指定配置文件的位置')
  .option('-h, --apiBase <string>', 'OceanPress server 地址')
  .option('-k, --apiKey <string>', 'OceanPress server Api 密钥')
  .action(async (opt: { config: string; apiBase: string; apiKey: string }) => {
    if (!opt.apiBase || !opt.apiKey) {
      return console.error(`请配置 apiBase 和 apiKey`)
    }
    const config = await readFile(opt.config, 'utf-8')
    loadConfigFile(JSON.parse(config))

    const ocean_press = new OceanPress(currentConfig.value)

    ocean_press.pluginCenter.registerPlugin({
      async build_onFileTree([tree], next) {
        const zip = await genZIP(tree, { withoutZip: true })
        const sizeInMB = zip.size / (1024 * 1024)
        console.log('[zip.size in MB]', sizeInMB.toFixed(2))
        // todo： 这里需要实现 调用 OceanPress server 接口将 zip 包上传部署。
        // await writeFile('dist.zip', new Uint8Array(await zip.arrayBuffer()));

      },
    })

    const res = await ocean_press.build()

    const obj = (await res.next()).value
    if (typeof obj === 'object' && !(obj instanceof Error)) {
      obj.log = (...arg) => {
        console.log(...arg)
      }
    }
    for await (const iterator of res) {
      if (typeof iterator === 'string') {
        if (iterator.startsWith('渲染：')) {
          process.stdout.write(`\r\x1b[K${iterator}`)
        } else {
          process.stdout.write(`\n${iterator}`)
        }
      } else {
        console.log(iterator + '\n')
      }
    }
  })

program.parse(process.argv)
