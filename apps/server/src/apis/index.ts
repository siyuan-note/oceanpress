import { ctxGetConfig } from '@/ctx';
import { writeFileWithStream } from '@/fileWriter';
import { createWriteStream } from 'fs';
import { readdir, stat, unlink } from 'fs/promises';
import { join, resolve } from 'path/posix';
import { pipeline } from 'stream/promises';
import { v7 as uuidv7 } from 'uuid';
import { open } from 'yauzl-promise';
/** 清理上传目录中超过超过一定时间的文件 */
export async function cleanupUploads(cleanFileAge = 24 * 60 * 60 * 1000) {
  const config = ctxGetConfig();

  const now = Date.now();
  const files = await readdir(config.uploadDir);

  for (const file of files) {
    const filePath = join(config.uploadDir, file);
    const stats = await stat(filePath);
    const fileAge = now - stats.mtimeMs;

    // 如果文件更新时间超过了，则删除
    if (fileAge > cleanFileAge) {
      await unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  }
}

/** 接受客户端上传的文件，并保存到本地临时文件存储目录中。返回对应的文件编号 */
export async function upload(readStream: ReadableStream) {
  const config = ctxGetConfig();
  // 创建一个可写流，将文件保存到本地
  const fileId = uuidv7();
  const filePath = join(config.uploadDir, fileId);
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
  const config = ctxGetConfig();

  // yauzl 不阻塞 js 线程的 zip 解压库
  const zipFilePath = join(config.uploadDir, options.zipFileId);
  const zip = await open(zipFilePath);
  const extractPath = config.extractPath;

  for await (const entry of zip) {
    if(entry.filename.endsWith('/')) {
      // 如果是目录 不用管
      continue;
    }
    // 检查文件路径是否在允许的目录范围内
    const resolvedPath = resolve(extractPath, entry.filename);
    if (!resolvedPath.startsWith(resolve(extractPath))) {
      throw new Error(`非法文件路径：${resolvedPath}`);
    }

    const readStream = await entry.openReadStream();
    const writeStream = await writeFileWithStream(resolvedPath);
    await pipeline(readStream, writeStream);
  }
  await zip.close();
  console.log('[deploy] 解压完成');

  // 清理上传文件夹中的旧文件
  cleanupUploads(1 * 60 * 60 * 1000);

  return '部署成功';
}

export const apis = {
  upload,
  deploy,
};
