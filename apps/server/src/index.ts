import fastifyCors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { createRPC } from 'oceanpress-rpc';
import { isAbsolute, resolve } from 'path/posix';
import { Readable } from 'stream';
import { deserialize, type SuperJSONResult } from 'superjson';
import { apis } from './apis';
import { config } from './config';
import { getCtx, setCtx } from './ctx';
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

const fastify = Fastify({
  logger: false,
});
fastify.register(fastifyCors, {
  origin: '*', // 允许所有来源
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 允许的 HTTP 方法
});

/** 对于 application/octet-stream 类型的请求转换为 web 兼容的 ReadableStream 供接口处理 */
fastify.addContentTypeParser('application/octet-stream', async function (request, payload, done) {
  const webStream = Readable.toWeb(payload);
  return webStream;
});

fastify.all('/api/*', async (request, reply) => {
  const method = request.url;
  console.log('[method]', method);
  const contentType = request.headers['content-type'];
  let data: any[];
  if (contentType === 'application/json') {
    data = deserialize(request.body as SuperJSONResult) as any[];
  } else {
    // 如果请求体不是 json 对象的话，意味着他可能是二进制，或者字符串，这里我们直接包裹成数组返回,因为 rpc 要求参数必须是数组的
    data = [request.body];
  }

  const apiKey = request.headers['x-api-key'] as string;

  setCtx({ apiKey });
  console.log('[data]', data);
  const result = await (await serverRPC).RC(method.slice(5), data);
  reply.send({ result });
});

// 提供静态文件服务
// 判断是否为绝对路径，如果不是则转换为绝对路径
const absoluteStaticDir = isAbsolute(config.STATIC_DIR)
  ? config.STATIC_DIR
  : resolve(config.STATIC_DIR);
console.log('[absoluteStaticDir]', absoluteStaticDir);
fastify.register(fastifyStatic, {
  root: absoluteStaticDir,
  prefix: '/',
});

const start = async () => {
  try {
    const listening = await fastify.listen({ port: config.SERVER_PORT, host: '0.0.0.0' });
    console.log(`Server listening on ${listening}`);
  } catch (err) {
    console.log('[err]', err);
    process.exit(1);
  }
};

start();
