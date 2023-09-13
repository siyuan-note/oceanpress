/** 
 * 创建一个 HttpMiddleware 提升优先级以覆盖 @malagu/web 中的 HttpMiddleware
 * 在这里拦截特定路径的请求，然后调用  api接口  */
import { Component } from '@malagu/core';
import { Middleware, Context } from '@malagu/web/lib/node';
import { API } from '../common/rpc/rpc';

@Component(Middleware)
export class HttpMiddleware implements Middleware {

    async handle(ctx: Context, next: () => Promise<void>): Promise<void> {
        if (ctx.request.originalUrl == "/tsRpc" || ctx.request.originalUrl.startsWith("/tsRpc/")) {
            let value: any
            try {
                const { method, data } = await new Promise<any>((r, j) => {
                    let rawData = '';
                    ctx.request.on("data", (chunk) => {
                        rawData += chunk
                    })
                    ctx.request.on("end", () => {
                        try {
                            try {
                                const jsonData = JSON.parse(rawData);
                                r(jsonData);
                            } catch (error) {
                                throw new Error(`反序列化失败，请确保请求体符合json标准`)
                            }
                        } catch (error) {
                            j(error);
                        }
                    });
                    ctx.request.on('error', (error: Error) => {
                        j(error);
                    });
                })
                //@ts-ignore
                if (typeof API[method] !== "function") {
                    throw new Error(`apis 没有提供方法：${method}`)
                }
                //@ts-ignore
                value = await API[method](...data)
                ctx.response.body = JSON.stringify({ status: "ok", value })

            } catch (error: any) {
                console.error(error);

                ctx.response.body = JSON.stringify({ status: "err", value, msg: error.message })
            }
        } else {
            await next();
        }
        const response = ctx.response;
        if (!Context.isSkipAutoEnd() && !response.writableEnded) {
            response.end(response.body);
        }
    }

    readonly priority = 4000;

}
