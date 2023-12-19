/** 默认填充函数，不应当被调用 */
const CallUnimplementedDependency: any = () => {
  throw "CallUnimplementedDependency";
};

/** ════════════════════════🏳‍🌈 全局依赖 🏳‍🌈════════════════════════
 *  供不同入口注入不同依赖实现
 ** ════════════════════════🚧 全局依赖 🚧════════════════════════ */
export const storeDep = {
  // 读写配置文件所依赖的副作用
  setItem: CallUnimplementedDependency as (key: string, value: string) => void,
  getItem: CallUnimplementedDependency as (key: string) => string | undefined,

  // render功能依赖的副作用
};
