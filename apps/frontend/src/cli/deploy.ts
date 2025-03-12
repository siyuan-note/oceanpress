import { readFile } from 'fs/promises'
import { createRPC } from 'oceanpress-rpc'
import type { API } from 'oceanpress-server'
import { stringify } from 'superjson'
import { currentConfig, loadConfigFile } from '~/core/config.ts'
import { genZIP } from '~/core/genZip.ts'
import { OceanPress } from '~/core/ocean_press.ts'
import { program } from './common.ts'

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
    console.log(333)

    const config = await readFile(opt.config, 'utf-8')
    loadConfigFile(JSON.parse(config))
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
    const ocean_press = new OceanPress(currentConfig.value)

    ocean_press.pluginCenter.registerPlugin({
      async build_onFileTree([tree], next) {
        const zip = await genZIP(tree, { withoutZip: true })
        const sizeInMB = zip.size / (1024 * 1024)
        console.log('[zip.size in MB]', sizeInMB.toFixed(2))
        // 将 Blob 转换为 ReadableStream
        const readableStream = zip.stream()
        const { chunkCount, fileId } = await client.API.upload(readableStream)

        console.log('[res]', { chunkCount, fileId })
        const res = await client.API.deploy({ zipFileId: fileId })
        console.log('[deploy res]', res)
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
