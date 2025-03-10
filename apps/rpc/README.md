# RPC

最简单好用的 ts rpc 方案

1. 前后端一致的类型定义
2. 可以跳转到对应定义的代码和查找引用 (需要可以直接导入未经过编译的 server api type)

需要注意的就是参数传递，你不能传递无法序列化的对象，例如你使用 json 传递参数，那你的接口 入参 和返回值都需要是合法 json。

想要传递复杂对象的话可以考虑使用 superjson , 或者自行定义其他的序列化逻辑

下面以 fastify 为例，使用 json 作为序列化方式，来展示一个简单的前后端 rpc 示例

## server

```typescript
const apis = {
  a: {
    b(n: number) {
      return { t: Date.now(), n };
    },
  },
};
export type API = typeof apis;
const serverRPC = await createRPC('apiProvider', {
  genApiModule: async () => {
    return apis;
  },
});
fastify.all('/api/*', async (request, reply) => {
  const method = request.url;
  const params = JSON.parse(request.body as string);
  const result = await serverRPC.RC(method.slice(5), params);
  reply.send({ result });
});
```

## client

```typescript
import { API } from 'server-npm_package';
const clientRPC = await createRPC<API>('apiConsumer', {
  remoteCall(method, data) {
    return fetch(`server-base-url/api/${method}`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((r) => r.result);
  },
});
const res = await clientRPC.API.a.b(33);
```
