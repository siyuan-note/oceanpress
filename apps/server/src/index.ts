import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import { createRPC } from 'oceanpress-rpc';
// 获取当前文件的路径
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件的目录路径
const __dirname = path.dirname(__filename);
// 加载环境变量
dotenv.config();

const fastify = Fastify({
  logger: false,
});

// 假设静态文件存储在 ./public 目录下
const staticDir = path.join(__dirname, 'public');
console.log('[staticDir]', staticDir);
// 确保静态文件目录存在
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

async function test({
  apiKey,
  notebookConfig,
  zipFile,
}: {
  apiKey: string;
  notebookConfig: any;
  zipFile: string;
}) {
  // 验证 apiKey
  if (apiKey !== process.env.API_KEY) {
    throw new Error('Unauthorized');
  }
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
});
fastify.all('/api/*', async (request, reply) => {
  const method = request.url;
  const params = JSON.parse(request.body as string);
  const result = await (await serverRPC).RC(method.slice(5), params);
  reply.send({ result });
});
// // 提供静态文件服务
// fastify.register(fastifyStatic, {
//   root: staticDir,
//   prefix: '/',
// });
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
