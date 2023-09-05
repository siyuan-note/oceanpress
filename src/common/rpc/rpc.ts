//  rpc.ts
/** ═════════🏳‍🌈 超轻量级的远程调用，完备的类型提示！ 🏳‍🌈═════════  */
import type * as apis from "../../node/apis";
import { rc } from "./rpc-adapter";

type apis = typeof apis;
type method = keyof apis;

/** Remote call ， 会就近的选择是远程调用还是使用本地函数 */
export let RC = <K extends method>(
    method: K,
    data: Parameters<apis[K]>
): Promise<unPromise<ReturnType<apis[K]>>> => {
    throw new Error("未正确加载 rc")
}
/** 修改 RC 函数 */
export function setRC(rc: typeof RC) {
    RC = rc
}
setRC(rc)
/** 解开 promise 类型包装 */
declare type unPromise<T> = T extends Promise<infer R> ? R : T;

/** 包装了一次的 RC 方便跳转到函数定义  */
export const API = new Proxy(
    {},
    {
        get(target, p: method) {
            return (...arg: any) => RC(p, arg);
        }
    }
) as apisPromiseify;

/** apis 中包含的方法可能不是返回 promise 的，但 RC 调用后的一定是返回 promsie */
type apisPromiseify = {
    readonly [K in keyof apis]: (
        ...arg: Parameters<apis[K]>
    ) => Promise<unPromise<ReturnType<apis[K]>>>;
};