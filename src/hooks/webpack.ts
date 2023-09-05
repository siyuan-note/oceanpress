//@ts-ignore  这里的代码是在编译期执行的，可以加载这些依赖，不用管这个报错
import { WebpackContext, ConfigurationContext } from '@malagu/cli-service';
//@ts-ignore
import * as webpack from 'webpack';
export default async (context: WebpackContext) => {
    const { configurations } = context;
    // const frontendConfig = ConfigurationContext.getFrontendConfiguration(configurations);
    const backendConfig = ConfigurationContext.getBackendConfiguration(configurations);

    if (backendConfig) {
        const tsRpc = new webpack.NormalModuleReplacementPlugin(
            /(.*)\/rpc-adapter$/,
            function (resource: any) {
                resource.request = resource.request + "-backend"
            }
        )
        backendConfig
            .plugin('tsRpc')
            .use(tsRpc);
    }
};