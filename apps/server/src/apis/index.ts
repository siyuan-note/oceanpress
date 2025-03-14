import { createWriteStream } from 'fs';
import { dirname, join } from 'path/posix';
import { v7 as uuidv7 } from 'uuid';
import { config } from '../config';
import { mkdir, readdir, stat, unlink } from 'fs/promises';
import { open } from 'yauzl-promise';
import { pipeline } from 'stream/promises';
/** 清理上传目录中超过超过一定时间的文件 */
export async function cleanupUploads(cleanFileAge = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  const files = await readdir(config.UPLOAD_DIR);

  for (const file of files) {
    const filePath = join(config.UPLOAD_DIR, file);
    const stats = await stat(filePath);
    const fileAge = now - stats.mtimeMs;

    // 如果文件更新时间超过了，则删除
    if (fileAge > cleanFileAge) {
      await unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  }
}

setInterval(() => {
  cleanupUploads(1 * 60 * 60 * 1000);
}, 60_000);

/** 接受客户端上传的文件，并保存到本地临时文件存储目录中。返回对应的文件编号 */
export async function upload(readStream: ReadableStream) {
  // 创建一个可写流，将文件保存到本地
  const fileId = uuidv7();
  const filePath = join(config.UPLOAD_DIR, fileId);
  const fileStream = createWriteStream(filePath);
  const reader = readStream.getReader();

  let chunkCount = 0;
  try {
    while (1) {
      const { done, value } = await reader.read();
      if (done) break;
      chunkCount++;
      fileStream.write(value);
    }
  } finally {
    // 等待文件关闭成功,这里 end 是接受一个回调，而非 Promise
    await new Promise((r) => {
      fileStream.end(r);
    });
  }
  return { fileId, chunkCount };
}

/**将对应的 zip 文件解压到指定 config.STATIC_DIR 目录中，采取流式解压，避免内存占用过高   */
export async function deploy(options: { zipFileId: string }) {
  // yauzl 不阻塞 js 线程的 zip 解压库
  const zipFilePath = join(config.UPLOAD_DIR, options.zipFileId);
  const zip = await open(zipFilePath);
  const extractPath = config.STATIC_DIR;

  for await (const entry of zip) {
    const filePath = join(extractPath, entry.filename);
    if (entry.filename.endsWith('/')) {
      const fileStat = await stat(filePath).catch((e) => null);
      if (fileStat === null) await mkdir(filePath);
    } else {
      const readStream = await entry.openReadStream();

      const dirPath = dirname(filePath);
      const fileStat = await stat(dirPath).catch((e) => null);
      if (fileStat === null) {
        await mkdir(dirPath, { recursive: true });
      }
      // 确保文件目录存在
      const writeStream = createWriteStream(filePath);
      await pipeline(readStream, writeStream);
    }
  }
  await zip.close();
  console.log('[deploy] 解压完成');

  return '部署成功';
}

export const apis = {
  upload,
  deploy,
};
// apps/server/uploads/01958ab9-3a7a-74fa-bfc0-e35fe90c7997
// deploy({ zipFileId: '01958ab9-3a7a-74fa-bfc0-e35fe90c7997' });
// /** 使用 adm-zip 将对应的 zip 文件解压到指定 config.STATIC_DIR 目录中，采取流式解压，避免内存占用过高   */
// export async function deploy(options: { zipFileId: string }) {
//   // yauzl 不阻塞 js 线程的 zip 解压库
//   const zipFilePath = join(config.UPLOAD_DIR, options.zipFileId);
//   const extractPath = config.STATIC_DIR;
//   const zipFileBlob = new Blob([await readFile(zipFilePath)]);
//   const zipFileReader = new BlobReader(zipFileBlob);
//   const zipReader = new ZipReader(zipFileReader);
//   for await (const entry of await zipReader.getEntries()) {
//     const filePath = join(extractPath, entry.filename);
//     console.log('[filePath]', filePath);
//     if (entry.filename.endsWith('/')) {
//       await mkdir(filePath);
//     } else {
//       const helloWorldWriter = new BlobWriter();
//       const blob = await entry.getData?.(helloWorldWriter);
//       if (blob === undefined) {
//         console.log('blob is undefined', filePath);
//       } else {
//         writeFile(filePath, Buffer.from(await blob.arrayBuffer()));
//       }
//     }
//   }

//   return '部署成功';
// }
