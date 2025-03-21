import { MeilisearchPlugin } from '~/plugins/meilisearch_plugin/meilisearch_upload.ts'
import { Config } from './config.ts'
import { PluginCenter } from './plugin.ts'
import { s3Upload_plugin } from '~/plugins/publish/s3.ts'
import { FileTree, build } from './build.ts'
import { renderHTML } from './render.ts'
import { deployOceanPressServer_plugin } from '~/plugins/publish/OceanPressServer.ts'
import type { effectDepApi } from './EffectDep.ts'

export type OceanPressPlugin = PluginCenter<OceanPress['funMap']>['pluginType']

/** OceanPress 核心类，用于管理插件和配置，执行构建过程。 */
export class OceanPress {
  build() {
    const build_res = this.pluginCenter.fun.build(this.config, {
      renderHtmlFn: this.pluginCenter.fun.build_renderHTML,
      onFileTree: this.pluginCenter.fun.build_onFileTree,
    })
    return build_res
  }
  funMap = {
    /** 开始整体编译 */
    build,
    /** 用于渲染文档的函数 */
    build_renderHTML: renderHTML,
    /** 编译完成后文件树的处理回调函数 */
    build_onFileTree: (_tree: FileTree, _effectApi: effectDepApi) => {},
  }
  pluginCenter: PluginCenter<OceanPress['funMap']> = new PluginCenter(
    this.funMap,
  )
  constructor(public config: Config) {
    // TODO 内置插件，以后应该改成由用户配置
    if (config.meilisearch.enable) {
      this.pluginCenter.registerPlugin(
        new MeilisearchPlugin(config.meilisearch),
      )
    }
    if (config.s3.enable) {
      this.pluginCenter.registerPlugin(s3Upload_plugin)
    }
    if (config.oceanPressServer.enable) {
      this.pluginCenter.registerPlugin(
        deployOceanPressServer_plugin(this.config),
      )
    }
  }
}
