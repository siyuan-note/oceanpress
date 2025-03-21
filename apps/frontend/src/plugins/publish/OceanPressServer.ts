import { createRPC } from 'oceanpress-rpc'
import type { API } from 'oceanpress-server'
import { stringify } from 'superjson'
import { type Config } from '~/core/config.ts'
import { genZIP } from '~/core/genZip.ts'
import type { OceanPressPlugin } from '~/core/ocean_press.ts'

/** 上传数据到 OceanPressServer 适配云端  */
export function deployOceanPressServer_plugin(config: Config) {
  const plugin: OceanPressPlugin = {
    async build_onFileTree([tree,effectApi], next) {
      next(tree,effectApi)
      const client = await createRPC<API>('apiConsumer', {
        async remoteCall(method, data) {
          let body: ReadableStream | string | Blob
          // 如果第一参数是 ReadableStream 的时候，直接使用 ReadableStream 作为 body，不用考虑其他参数，因为这种情况只支持一个参数
          let content_type
          if (data[0] instanceof ReadableStream) {
            // body = data[0] //会遇到一些兼容性问题， http 1.1 不支持使用流作为 body，需要转换为 blob 或者 arraybuffer

            body = await new Response(data[0]).blob()
            content_type = 'application/octet-stream'
          } else {
            body = stringify(data)
            console.log('[body]', body)
            content_type = 'application/json'
          }
          return fetch(`${config.oceanPressServer.apiBase}/api/${method}`, {
            method: 'POST',
            body,
            headers: {
              'x-api-key': config.oceanPressServer.apiKey,
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
  }
  return plugin
}
