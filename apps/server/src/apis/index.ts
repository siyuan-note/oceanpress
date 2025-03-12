import { createWriteStream } from 'fs';
import { join } from 'path/posix';
import { v7 as uuidv7 } from 'uuid';
import { config } from '../config';
import { readdir, stat, unlink } from 'fs/promises';

/**
 * 清理上传目录中超过 24 小时的文件
 */
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

export async function upload(readStream: ReadableStream) {
  // 创建一个可写流，将文件保存到本地
  const fileId = uuidv7();
  const filePath = join(config.UPLOAD_DIR, fileId);
  const fileStream = createWriteStream(filePath);
  const reader = readStream.getReader();

  let chunkCount = 0;
  while (1) {
    const { done, value } = await reader.read();
    if (done) break;
    chunkCount++;
    fileStream.write(value);
  }

  return { fileId, chunkCount };
}

export const apis = {
  /** 接受客户端上传的文件，并保存到本地临时文件存储目录中。返回对应的文件编号 */
  upload,
  deploy: async (zipCode: string) => {
    return 'eeee';
  },
};
