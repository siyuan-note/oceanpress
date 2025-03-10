/** ═════════🏳‍🌈 超轻量级的远程调用，完备的类型提示！ 🏳‍🌈═════════  */
export async function createRPC<API_TYPE>(
  ...[type, options]:
    | [
        'apiProvider',
        {
          genApiModule: () => Promise<API_TYPE>;
        },
      ]
    | [
        'apiConsumer',
        {
          /** 配置此选项替换默认的远程调用函数，默认逻辑采用 fetch 实现。 */
          remoteCall: (method: string, data: any[]) => Promise<any>; // 远程调用函数
        },
      ]
) {
  const apiModule = type === 'apiProvider' ? await options.genApiModule() : undefined;

  const remoteCall = type === 'apiConsumer' ? options.remoteCall : undefined;
  async function RC<K extends string>(method: K, data: any[]): Promise<any> {
    if (type === 'apiProvider') {
      try {
        const methodParts = method.split('.');
        let currentObj: any = apiModule;
        for (const part of methodParts) {
          if (currentObj && typeof currentObj === 'object' && part in currentObj) {
            currentObj = currentObj[part];
          } else {
            throw new Error(`Method ${method} not found`);
          }
        }
        if (typeof currentObj === 'function') {
          return await currentObj(...data);
        } else {
          throw new Error(`${method} is not a function`);
        }
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
      }
    } else {
      try {
        return await remoteCall!(method, data);
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
      }
    }
  }

  /** Remote call ， 会就近的选择是远程调用还是使用本地函数 */

  /** 创建嵌套的Proxy处理器 */
  function createNestedProxy(path: string[] = []): ProxyHandler<object> {
    return {
      get(target, prop: string) {
        if (prop === 'then') {
          // Handle the case when the proxy is accidentally treated as a Promise
          return undefined;
        }
        const newPath = [...path, prop];
        return new Proxy(function (...args: any[]) {
          const method = newPath.join('.');
          return RC(method, args);
        }, createNestedProxy(newPath));
      },
      apply(target, thisArg, args) {
        const method = path.join('.');
        return RC(method, args);
      },
    };
  }
  /** 包装了一次的 RC 方便跳转到函数定义  */
  const API = new Proxy(function () {}, createNestedProxy()) as unknown as NestedAsyncAPI<API_TYPE>;
  return { API, RC };
}

type AsyncifyReturnType<T> = T extends (...args: any[]) => infer R
  ? R extends Promise<any>
    ? T
    : (...args: Parameters<T>) => Promise<Awaited<R>>
  : T;

type DeepAsyncify<T> = T extends (...args: any[]) => any
  ? AsyncifyReturnType<T>
  : T extends object
  ? { [K in keyof T]: DeepAsyncify<T[K]> }
  : T;
/** 因为如果是客户端调用，那么返回值必须要是 promise 风格的，所以使用这个类型来将所有返回值的类型包裹一层promise */
type NestedAsyncAPI<T> = {
  [K in keyof T]: DeepAsyncify<T[K]>;
};
