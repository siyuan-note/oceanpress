import { createRPC } from './createRPC';

async function main() {
  const apis = {
    test() {
      return 'Hello, world!';
    },
  };
  const serverRPC = await createRPC('apiProvider' as const, {
    genApiModule: async () => {
      return apis;
    },
    middleware: [
      async (method, data, next) => {
        console.log(1);
        return next();
      },
    ],
  });

  const clientRPC = await createRPC<typeof apis>('apiConsumer', {
    remoteCall: async (method, data) => {
      const result = await serverRPC.RC(method, data);
      return result;
    },
  });
  serverRPC.API.test().then(console.log); // Output: Hello, world!
  clientRPC.API.test().then(console.log); // Output: Hello, world!
}
main();
