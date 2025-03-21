import { S3 } from '@aws-sdk/client-s3'
import type { OceanPressPlugin } from '~/core/ocean_press.ts'
import type { uploadFiles } from './interface.ts'

/** 上传数据到 s3 适配云端 */
export const s3Upload_plugin: OceanPressPlugin = {
  build: function ([config, otherConfig], next) {
    return next(config, {
      ...otherConfig,

      onFileTree: async (tree, effectApi) => {
        if (otherConfig?.onFileTree) {
          // 维持原有其他监听程序
          await otherConfig.onFileTree(tree, effectApi)
        }
        for await (const [fileName, ETag] of s3_uploads(tree, config)) {
          effectApi.log(`上传： ${fileName} ${ETag}`)
        }
        effectApi.log(`s3 上传完毕`)
      },
    })
  },
}
const s3_uploads: uploadFiles = async function* (tree, config) {
  // https://help.aliyun.com/zh/oss/developer-reference/use-amazon-s3-sdks-to-access-oss#section-2ri-suq-pb3

  const s3 = new S3({
    region: config.s3.region,
    endpoint: config.s3.endpoint,
    credentials: {
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
    },
  })
  // 将文件逐个上传至 s3
  // TODO 可改成并发上传，以缩短时间
  const encoder = new TextEncoder()
  for (const [path, value] of Object.entries(tree)) {
    let buffer: Uint8Array
    if (typeof value === 'string') {
      buffer = encoder.encode(value)
    } else {
      buffer = new Uint8Array(value)
    }
    const r = await s3.putObject({
      Bucket: config.s3.bucket,
      Key: (config.s3.pathPrefix + path).replace(/\/\//g, '/'),
      Body: buffer,
    })
    yield [path, r.ETag] as const
  }
}
