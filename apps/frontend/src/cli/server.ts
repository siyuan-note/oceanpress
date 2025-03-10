import { readFile } from 'fs/promises'
import { setCache } from '~/core/cache.ts'
import { loadConfigFile } from '~/core/config.ts'
import { server } from '~/server.ts'
import { program } from './common.ts'
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
