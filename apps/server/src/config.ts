import dotenv from 'dotenv';
// 加载环境变量
const c = dotenv.config().parsed ?? {};

export const config = {
  API_KEY: c.API_KEY,
  UPLOAD_DIR: c.UPLOAD_DIR,
};

if (c.API_KEY === undefined) {
  throw new Error('API_KEY is not defined in .env file');
}
if (c.UPLOAD_DIR === undefined) {
  throw new Error('UPLOAD_DIR is not defined in .env file');
}
