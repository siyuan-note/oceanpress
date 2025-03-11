const ctxMap = new WeakMap<
  any,
  {
    apiKey: string; // 存储 apiKey
    // 其他上下文信息
  }
>();

export const setCtx = (key: any, ctx: { apiKey: string }) => {
  ctxMap.set(key, { ...getCtx(key), ...ctx });
};

export const getCtx = (key: any) => {
  return ctxMap.get(key);
};
