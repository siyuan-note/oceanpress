import { config, deployConfig } from '@/config';
import { AsyncLocalStorage } from 'async_hooks';

// 创建一个 AsyncLocalStorage 实例来存储上下文
const asyncLocalStorage = new AsyncLocalStorage<{ apiKey: string }>();

// 设置上下文
export const setCtx = (ctx: { apiKey: string }) => {
  const currentStore = asyncLocalStorage.getStore();
  asyncLocalStorage.enterWith({ ...currentStore, ...ctx });
};

// 获取上下文
export const getCtx = () => {
  return asyncLocalStorage.getStore();
};

// 示例：在异步操作中使用上下文
export const runWithCtx = (ctx: { apiKey: string }, callback: () => void) => {
  asyncLocalStorage.run(ctx, callback);
};

export function ctxGetConfig() {
  const ctx = getCtx();
  if (!ctx) {
    throw new Error('Context not found');
  }
  const uploadDir = config.UPLOAD_DIR;
  const extractPath = deployConfig[ctx.apiKey]?.deployDir || config.STATIC_DIR; // 使用 apiKey 从 deployConfig 中获取 deployDir
  return {
    uploadDir,
    extractPath,
  };
}
