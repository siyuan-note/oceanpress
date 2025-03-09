import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import dotenv from 'dotenv';
import { initTRPC } from '@trpc/server';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';

// 加载环境变量
dotenv.config();

const fastify = Fastify({
  logger: true,
});

// 假设静态文件存储在 ./public 目录下
const staticDir = path.join(__dirname, 'public');

// 确保静态文件目录存在
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

// 初始化 tRPC
const t = initTRPC.create();

// 定义 tRPC 路由
const appRouter = t.router({
  deploy: t.procedure
    .input((val: unknown) => {
      if (
        typeof val === 'object' &&
        val !== null &&
        'apiKey' in val &&
        'notebookConfig' in val &&
        'zipFile' in val
      ) {
        return val as { apiKey: string; notebookConfig: any; zipFile: string };
      }
      throw new Error('Invalid input');
    })
    .mutation(async ({ input }) => {
      const { apiKey, notebookConfig, zipFile } = input;

      // 验证 apiKey
      if (apiKey !== process.env.API_KEY) {
        throw new Error('Unauthorized');
      }

      // 解压 zip 文件
      const zip = new AdmZip(Buffer.from(zipFile, 'base64'));
      zip.extractAllTo(staticDir, true);

      return { success: true, message: 'Deployment successful' };
    }),
});

// 注册 tRPC 插件
fastify.register(fastifyTRPCPlugin, {
  prefix: '/trpc',
  trpcOptions: { router: appRouter },
});
import fastifyStatic from '@fastify/static';
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

export type AppRouter = typeof appRouter;
