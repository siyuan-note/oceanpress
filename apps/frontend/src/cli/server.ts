import { readFile } from 'fs/promises'
import { setCache } from '~/core/cache.ts'
import { loadConfigFile, tempConfig } from '~/core/config.ts'
import { server } from '~/server.ts'
import { program } from './common.ts'
import { Context, Effect } from 'effect'
import {
  EffectRender,
  EffectLocalStorageDep,
  EffectLogDep,
} from '~/core/EffectDep.ts'
import { renderApiDep } from '~/core/render.api.dep.ts'
import { nodeApiDep } from '~/util/store.node.dep.ts'

function validatePort(port: string): number {
  const portNum = Number(port)
  if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
    throw new Error(`端口号必须在 1-65535 之间，当前值: ${port}`)
  }
  return portNum
}
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
      cache: string
    }) => {
      if (!opt.config) {
        console.log(`请设置配置文件位置`)
        throw new Error('请设置配置文件位置')
      }
      let config
      try {
        config = await readFile(opt.config, 'utf-8')
      } catch (error) {
        console.error('配置文件读取失败:', error)
        throw new Error('配置文件读取失败')
      }
      setCache(opt.cache !== 'false')

      const context = Context.empty().pipe(
        Context.add(EffectRender, renderApiDep),
        Context.add(EffectLocalStorageDep, nodeApiDep),
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

      const p = Effect.provide(
        Effect.gen(function* () {
          let parsedConfig
        try {
          parsedConfig = JSON.parse(config)
        } catch (error) {
          console.error('配置文件解析失败:', error)
          throw new Error('配置文件格式错误')
        }
        yield* loadConfigFile(parsedConfig)
          /** 使用本地的文件，方便调试 */
          tempConfig.cdn.siyuanPrefix = '/notebook/'
          return yield* server({
            hostname: opt.host,
            port: validatePort(opt.port),
          })
        }),
        context,
      )

      await Effect.runPromise(p)
    },
  )
