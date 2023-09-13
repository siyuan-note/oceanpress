
/** 通过 [d](src/hooks/webpack.ts) 中对于 rpc-adaper 的替换实现，当编译后端代码时，此文件不会被引入，
 * 引入的是 rpc-adaper-backend ，这样避免了apis相关的代码被打包到前端
*/
export function rc(
    method: any,
    data: any
) {
    // 浏览器端运行
    return fetch("tsRpc",{
        body:JSON.stringify({method,data}),
        method:"POST"
    }).then(async r => {
        const res = (await r.json()).value
        console.log("res", res);
        return res
    })
}