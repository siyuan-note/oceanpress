import { createRPC } from './createRPC';
export { createRPC };
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
  });

  const clientRPC = await createRPC<typeof apis>('apiConsumer', {
    remoteCall: async (method, data) => {
      const result = await serverRPC.RC(method, data);
      return result;
    },
  });

}
main();
