import dotenv from 'dotenv';
// 加载环境变量
const c = dotenv.config().parsed ?? {};
if (c.API_KEY === undefined) {
  throw new Error('API_KEY is not defined in .env file');
}

export const config = {
  API_KEY: c.API_KEY,
};
