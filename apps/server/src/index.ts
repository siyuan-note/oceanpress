import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import { createRPC } from 'oceanpress-rpc';
import { getCtx, setCtx } from './ctx';
import { config } from './config';
// 获取当前文件的路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件的目录路径
const __dirname = path.dirname(__filename);
config;

const fastify = Fastify({
  logger: false,
});

// 假设静态文件存储在 ./public 目录下
const staticDir = path.join(__dirname, 'public');
// 确保静态文件目录存在
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

async function test({ notebookConfig, zipFile }: { notebookConfig: any; zipFile: string }) {
  // 验证 apiKey

  return '测试结果';
  // 解压 zip 文件
  const zip = new AdmZip(Buffer.from(zipFile, 'base64'));
  zip.extractAllTo(staticDir, true);

  return { success: true, message: 'Deployment successful' };
}
const apis = {
  test,
  a: {
    b(n: number) {
      return { t: Date.now(), n };
    },
  },
};
export type API = typeof apis;

const serverRPC = createRPC('apiProvider', {
  genApiModule: async () => {
    return apis;
  },
  middleware: [
    /** 实现 apiKey 的验证中间件 */
    async (method, data, next) => {
      const ctx = getCtx(data);
      if (ctx?.apiKey !== config.API_KEY) {
        throw new Error('Unauthorized 不正确的 apiKey');
      }
      return next();
    },
  ],
});
fastify.all('/api/*', async (request, reply) => {
  const method = request.url;
  const data = JSON.parse(request.body as string);

  const apiKey = request.headers['x-api-key'] as string;

  setCtx(data, { apiKey });

  const result = await (await serverRPC).RC(method.slice(5), data);
  reply.send({ result });
});
// 提供静态文件服务
fastify.register(fastifyStatic, {
  root: staticDir,
  prefix: '/',
});
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
