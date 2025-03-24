import { readFile } from 'fs/promises'
import { createRPC } from 'oceanpress-rpc'
import type { API } from 'oceanpress-server'
import { stringify } from 'superjson'
import { currentConfig, loadConfigFile } from '~/core/config.ts'
import { genZIP } from '~/core/genZip.ts'
import { OceanPress } from '~/core/ocean_press.ts'
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

    const client = await createRPC<API>('apiConsumer', {
      remoteCall(method, data) {
        let body: ReadableStream | string
        // 如果第一参数是 ReadableStream 的时候，直接使用 ReadableStream 作为 body，不用考虑其他参数，因为这种情况只支持一个参数
        let content_type
        if (data[0] instanceof ReadableStream) {
          body = data[0]
          content_type = 'application/octet-stream'
        } else {
          body = stringify(data)
          console.log('[body]', body)
          content_type = 'application/json'
        }
        return fetch(`${opt.apiBase}/api/${method}`, {
          method: 'POST',
          body,
          headers: {
            'x-api-key': opt.apiKey,
            'Content-Type': content_type,
          },
          // @ts-expect-error 在 node 运行的时候需要声明双工模式才能正确发送 ReadableStream，TODO 需要验证浏览器端可以这样运行吗
          duplex: 'half', // 关键：显式声明半双工模式
        })
          .then((res) => res.json())
          .then((r) => {
            if (r.error) {
              console.log('[r]', r)
              throw new Error()
            }
            return r.result
          })
      },
    })

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
        const ocean_press = new OceanPress(currentConfig.value)

        ocean_press.pluginCenter.registerPlugin({
          async build_onFileTree([tree], next) {
            const zip = await genZIP(tree, { withoutZip: true })
            const sizeInMB = zip.size / (1024 * 1024)
            console.log('[zip.size in MB]', sizeInMB.toFixed(2))
            // 将 Blob 转换为 ReadableStream
            const readableStream = zip.stream()
            const { chunkCount, fileId } = await client.API.upload(
              readableStream,
            )

            console.log('[res]', { chunkCount, fileId })
            const res = await client.API.deploy({ zipFileId: fileId })
            console.log('[deploy res]', res)
          },
        })

        return yield* ocean_press.build()
      }),
      context,
    )

    await Effect.runPromise(p)
  })
