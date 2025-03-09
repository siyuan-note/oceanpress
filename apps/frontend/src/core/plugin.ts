/** 基于洋葱 HOOk 机制的插件管理器
 * 我感觉这个手搓的插件机制还可以，类型完备，可拓展性强，
 */
export class PluginCenter<T extends Record<string, (...args: any[]) => any>> {
  plugins: PluginCenter<T>['pluginType'][] = []
  registerPlugin(plugin: PluginCenter<T>['pluginType']) {
    this.plugins.push(plugin)
  }
  removePlugin(plugin: PluginCenter<T>['pluginType']) {
    this.plugins = this.plugins.filter((p) => p !== plugin)
  }
  /** 洋葱hook调用机制的实现 */
  callFn<R extends keyof PluginCenter<T>['pluginType']>(
    name: R,
    fn: GetMiddlewareFunc<Required<PluginCenter<T>['pluginType']>[R]>,
  ) {
    return ((...arg: any) => {
      // 此处可优化，不必每次都重新生成 middlewareRunner
      const m = new middlewareRunner(fn)
      //   注入 plugins 中的对应中间件
      for (const plugin of this.plugins) {
        const middleware = plugin[name]
        if (middleware) {
          m.use(middleware)
        }
      }
      return m.runMiddlewareHandel(...arg)
    }) as GetMiddlewareFunc<Required<PluginCenter<T>['pluginType']>[R]>
  }
  /** 辅助类型，不可调用！ */
  pluginType: {
    [key in keyof PluginCenter<T>['_funMap']]?: FuncMiddlewares<
      PluginCenter<T>['_funMap'][key]
    >
  } = 0 as any
  /** 对需要调用的函数进行代理,完成插件hook介入。 */
  fun: PluginCenter<T>['_funMap']
  constructor(public _funMap: T) {
    const that = this
    // 可以改成生成对象 {} 的方式，比 proxy 开销要小
    this.fun = new Proxy({} as T, {
      get(_target, propertyKey, receiver) {
        const method = Reflect.get(that._funMap, propertyKey, receiver)
        if (typeof method === 'function') {
          return (...args: any) => {
            return that.callFn(
              propertyKey as keyof T,
              //@ts-ignore  懒得推类型了。属于内部实现，就直接忽略掉吧
              method,
            )(...args)
          }
        }
        return method
      },
    })
  }
}

type GetMiddlewareFunc<T> = T extends FuncMiddlewares<infer R> ? R : never

// 小中间件实现,接收一个函数 handel 作为最终执行的函数，当执行 runMiddlewareHandel 时等价于执行 Handel
// 通过 use 注册中间件，类似于洋葱路由,先注册的先执行
type FuncMiddlewares<Handel extends (...args: any[]) => any> = (
  ctx: Parameters<Handel>,
  next: Handel,
) => ReturnType<Handel>
class middlewareRunner<Handel extends (...args: any[]) => any> {
  middlewares: FuncMiddlewares<Handel>[] = []
  constructor(public handel: Handel) {}
  use(middleware: FuncMiddlewares<Handel>) {
    this.middlewares.push(middleware)
  }
  runMiddlewareHandel(...ctx: Parameters<typeof this.handel>) {
    let index = 0
    const next = ((...ctx2: Parameters<Handel>) => {
      const middleware = this.middlewares[index]
      index++
      if (middleware === undefined) {
        return this.handel.call(this, ...ctx2)
      }
      return middleware(ctx2, next)
    }) as Handel
    return next.call(this, ...ctx)
  }
}
