// @ts-expect-error
import { ZstdCodec } from 'zstd-codec'
import { decompress } from 'fzstd'
//  'objects/4d/2414fe33d9a48b7f20f73247a73d1a945f8b9f'  读取具体的文件对象
// const fileName = 'objects/bf/21a9e8fbc5a3846fb05b4fa0859e0917b2202f'
// const fileName = 'indexes/4821e6b541ee1f2f6cdbc0e0e9596336a2904890'
// indexes/4821e6b541ee1f2f6cdbc0e0e9596336a2904890
export async function newSiyuanRepo(options: {
  userId: string
  dir: string
  key: string
}) {
  const zstd: any = await new Promise((r) => {
    ZstdCodec.run(async (z: any) => {
      r(z)
    })
  })
  const simple = new zstd.Simple()

  const base64String = options.key
  const binaryData = atob(base64String)
  const key = Uint8Array.from(binaryData, (c) => c.charCodeAt(0))
  // 将密钥转换为 CryptoKey
  const cryptoKey = await crypto.subtle.importKey(
    'raw', // Key format
    key, // The raw key (ArrayBuffer or TypedArray)
    { name: 'AES-GCM' }, // Algorithm name
    false, // Extractable (whether the key can be extracted)
    ['decrypt'], // Allowed operations (we only need 'decrypt')
  )

  const decoder = new TextDecoder()
  // const decodedString = decoder.decode(data)
  const repo = {
    id2objectsPath(id: string) {
      return `objects/${id.slice(0, 2)}/${id.slice(2)}`
    },
    readeObject: async (fileName: string) => {
      const arrayBuffer = await (
        await fetch(
          `https://siyuan-data.b3logfile.com/siyuan/${options.userId}/repo/${options.dir}/${fileName}`,
        )
      ).arrayBuffer()
      // 将 ArrayBuffer 转换为 Uint8Array
      let data = new Uint8Array(arrayBuffer)
      if (fileName.startsWith('objects')) {
        // 此目录下的文件需要解密
        const extractedIv = data.slice(0, 12) // 前12字节是 IV
        const encryptedMessage = data.slice(12) // 剩下的是密文
        data = new Uint8Array(
          await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: extractedIv }, // Algorithm name and initialization vector
            cryptoKey, // The CryptoKey object
            encryptedMessage, // The data to decrypt (ArrayBuffer or TypedArray)
          ),
        )
      }
      console.log('[fileName]', fileName, data.length)

      // zstd 压缩的标识 (小端序): 0xFD2FB528  https://datatracker.ietf.org/doc/html/rfc8878#name-zstandard-frames
      const targetSequence = new Uint8Array([0x28, 0xb5, 0x2f, 0xfd])
      // 通过 subarray 获取开头的子数组并进行比较
      const isMatch = data
        .subarray(0, targetSequence.length)
        .every((value, index) => value === targetSequence[index])

      if (isMatch) {
        const newData = decompress(data)
        data = newData
      }
      return data
    },
    readeIndexesAll: async () => {
      const data = await repo.readeObject('indexes-v2.json')
      return JSON.parse(decoder.decode(data)) as indexesJSON
    },
    readeIndexes: async (id: string) => {
      const data = await repo.readeObject('indexes/' + id)
      return JSON.parse(decoder.decode(data)) as indexes
    },
    latestIndexes: async () => {
      const id = decoder.decode(await repo.readeObject('refs/latest'))
      return await repo.readeIndexes(id)
    },
    readFileMeta: async (id: string) => {
      const data = await repo.readeObject(repo.id2objectsPath(id))
      // console.log('[data.slice(0,9)]', data.slice(0, 9))
      const meta = decoder.decode(data)
      return JSON.parse(meta) as fileMeta
    },
    readFile: async (id: string) => {
      const meta = await repo.readFileMeta(id)
      console.log('[meta]', meta)
      const file = mergeUint8Arrays(
        await Promise.all(
          meta.chunks.map((id) => repo.readeObject(repo.id2objectsPath(id))),
        ),
      )
      return { meta, file }
    },
  }
  return repo
}

export type indexesJSON = {
  indexes: {
    id: string
    systemID: string
    systemName: string
    systemOS: string
  }[]
}

export type indexes = {
  id: string
  memo: string
  created: number
  files: string[]
  count: number
  size: number
  systemID: string
  systemName: string
  systemOS: string
  checkIndexID: string
}
export type fileMeta = {
  id: string
  path: string
  size: number
  updated: number
  chunks: string[]
}

function uint8ArrayToFile(uint8Array: Uint8Array, filename: string): File {
  const blob = new Blob([uint8Array], { type: getMimeType(uint8Array) }) // 创建 Blob 对象
  return new File([blob], filename, { type: blob.type }) // 创建 File 对象
}

function getMimeType(uint8Array: Uint8Array): string {
  const bytes = uint8Array.subarray(0, 4) // 获取前四个字节
  const hex = Array.from(bytes)
    .map((b) => ('0' + b.toString(16)).slice(-2)) // 转换为十六进制字符串
    .join('')

  // 根据文件头判断类型
  switch (hex) {
    case 'ffd8ffe0':
    case 'ffd8ffe1':
    case 'ffd8ffe2':
      return 'image/jpeg'
    case '89504e47':
      return 'image/png'
    case '47494638':
      return 'image/gif'
    case '25504446':
      return 'application/pdf'
    // 添加更多文件类型判断
    default:
      return 'application/octet-stream' // 默认类型
  }
}

// function decodeUint8Array(uint8Array: Uint8Array, encoding: string) {
//   const decoder = new TextDecoder(encoding)
//   return decoder.decode(uint8Array)
// }

function mergeUint8Arrays(arrays: Uint8Array[]) {
  // 计算所有 Uint8Array 的总长度
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0)
  // 创建一个新的 Uint8Array
  const merged = new Uint8Array(totalLength)

  let offset = 0
  for (const arr of arrays) {
    // 使用 set 方法将内容复制到 merged 中
    merged.set(arr, offset)
    offset += arr.length
  }

  return merged
}
