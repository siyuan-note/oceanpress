import dotenv from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
// 加载环境变量
const c = dotenv.config().parsed ?? {};

export const config = {
  API_KEY: c.API_KEY,
  UPLOAD_DIR: c.UPLOAD_DIR ?? './uploads',
  /** 静态文件存储目录 */
  STATIC_DIR: c.STATIC_DIR ?? 'static',
  SERVER_PORT: Number(c.SERVER_PORT ?? 80),
};

if (c.API_KEY === undefined) {
  throw new Error('API_KEY is not defined in .env file');
}

// 确保静态文件目录存在
if (!existsSync(config.STATIC_DIR)) {
  mkdirSync(config.STATIC_DIR, { recursive: true });
}
if (!existsSync(config.UPLOAD_DIR)) {
  mkdirSync(config.UPLOAD_DIR, { recursive: true });
}
