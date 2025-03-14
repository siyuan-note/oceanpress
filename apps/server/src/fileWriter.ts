import { dirname, resolve } from 'path';
import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';

/**
 * 使用 createWriteStream 写入文件，如果路径不存在则自动创建
 * @param filePath 文件路径
 * @param content 文件内容
 */
export async function writeFileWithStream(filePath: string) {
  // 将相对路径转换为绝对路径
  const absolutePath = resolve(filePath);

  // 获取目录路径
  const dirPath = dirname(absolutePath);

  // 检查目录是否存在，如果不存在则创建
  await mkdir(dirPath, { recursive: true });

  // 创建写入流
  const writeStream = createWriteStream(absolutePath);
  return writeStream;
}