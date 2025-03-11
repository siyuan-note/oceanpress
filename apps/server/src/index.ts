import Fastify from 'fastify';
import fs, { createWriteStream } from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import { createRPC } from 'oceanpress-rpc';
import { getCtx, setCtx } from './ctx';
import { config } from './config';
import type { IncomingMessage } from 'http';
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

const apis = {
  /**
   * 接受客户端上传的文件，并保存到本地临时文件存储目录中。
   * 返回对应的文件编号
   * 并且在之后的时间中定时清理掉此文件
   *  */
  upload: async (playload: IncomingMessage) => {
    const ctx = getCtx();
    // 创建一个可写流，将文件保存到本地
    const fileStream = createWriteStream('./file.bin');

    // 将传入的数据流通过管道传输到文件流中
    playload.pipe(fileStream);

    return { ctx };
  },
  deploy: async (zipCode: string) => {
    return 'eeee';
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
      const ctx = getCtx();
      if (ctx?.apiKey !== config.API_KEY) {
        throw new Error('Unauthorized 不正确的 apiKey');
      }
      return next();
    },
  ],
});

/** 对于 application/octet-stream 类型的请求直接将 payload 传递过去 */
fastify.addContentTypeParser('application/octet-stream', async function (request, payload, done) {
  return payload;
});

fastify.all('/api/*', async (request, reply) => {
  const method = request.url;
  console.log('[method]', method);
  const contentType = request.headers['content-type'];
  let data: any[];
  if (contentType === 'application/json') {
    data = request.body as any[];
  } else {
    // 如果请求体不是 json 对象的话，意味着他可能是二进制，或者字符串，这里我们直接包裹成数组返回,因为 rpc 要求参数必须是数组的
    data = [request.body];
  }

  const apiKey = request.headers['x-api-key'] as string;

  setCtx({ apiKey });

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
