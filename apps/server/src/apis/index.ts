import { createWriteStream } from 'fs';
import { join } from 'path/posix';
import { v7 as uuidv7 } from 'uuid';
import { config } from '../config';

export const apis = {
  /**
   * 接受客户端上传的文件，并保存到本地临时文件存储目录中。
   * 返回对应的文件编号
   * 并且在之后的时间中定时清理掉此文件
   *  */
  upload: async (readStream: ReadableStream) => {
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
  },
  deploy: async (zipCode: string) => {
    return 'eeee';
  },
};
