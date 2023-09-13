import * as apis from "../../node/apis";

export function rc(
    method: any,
    data: any
) {
    // 服务端运行
    return new Promise((r) => {
        //@ts-ignore
        r(apis[method](...data))

    })
}