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
          yield* loadConfigFile(JSON.parse(config))
          /** 使用本地的文件，方便调试 */
          tempConfig.cdn.siyuanPrefix = '/notebook/'
          return yield* server({
            hostname: opt.host,
            port: Number(opt.port),
          })
        }),
        context,
      )

      await Effect.runPromise(p)
    },
  )
