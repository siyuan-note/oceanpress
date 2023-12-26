import type { uploadFiles } from './interface.ts'
import { S3Client } from '@aws-sdk/client-s3'

export const s3_uploads: uploadFiles = async (tree, config) => {
  // https://help.aliyun.com/zh/oss/developer-reference/use-amazon-s3-sdks-to-access-oss#section-2ri-suq-pb3
  new S3Client({
    region: 'us-east-1',
    endpoint: 'https://s3.us-east-1.amazonaws.com',
    credentials: {
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    },
  })
}
