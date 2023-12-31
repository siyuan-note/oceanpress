import { defineComponent } from 'vue'
import {
  NCheckbox,
  NCollapse,
  NCollapseItem,
  NDivider,
  NInput,
  NStep,
} from 'naive-ui'
import { currentConfig } from '~/core/config.ts'

export default defineComponent({
  setup() {
    return {
      currentConfig,
    }
  },
  render() {
    return (
      <NStep title="其他配置">
        <NCollapse>
          <NCollapseItem title="打包选项" name="1" style="text-align: start">
            <NCheckbox v-model:checked={this.currentConfig.compressedZip}>
              打包成 zip(在浏览器端打包完毕后会弹出保存对话窗口)
            </NCheckbox>
            <NDivider />
            <NCheckbox v-model:checked={this.currentConfig.withoutPublicZip}>
              不打包appearance、stage 等公共资源（开启了cdn就选这个不打包，
              <br />
              这些资源将近19mb「下载只需要6~7mb」，
              <br />
              当然你如果自行部署的话也可以选这个不打包来节省时间，
              <br />
              这些资源一般没有变化所以部署一次即可。）
            </NCheckbox>
            <NDivider />
            <NCheckbox v-model:checked={this.currentConfig.excludeAssetsCopy}>
              不复制 assets/ 资源，勾选此选项则需要自行处理资源文件
            </NCheckbox>
            <NDivider />
            <NCheckbox v-model:checked={this.currentConfig.sitemap.enable}>
              输出 sitemap.xml 文件
            </NCheckbox>
            <br />
            <h4>路径前缀</h4>
            <NInput v-model:value={this.currentConfig.sitemap.sitePrefix}>
              {' '}
            </NInput>
            默认值为 "." 生成路径例如 "./record/思源笔记.html" <br />
            但 sitemap 并不建议采用相对路径所以应该替换成例如
            "https://shenzilong.cn" <br />
            则会生成 "https://shenzilong.cn/record/思源笔记.html" 这样的绝对路径
            <br />
            参见 https://www.sitemaps.org/protocol.html#escaping
            <NDivider />
            <NCheckbox
              v-model:checked={this.currentConfig.enableIncrementalCompilation}
            >
              开启增量编译，当资源的 hash 值没有变化时不会编译
              <br />
              会根据配置文件中的__skipBuilds__字段跳过一些没有变化不需要重新输出的内容
              <br />
            </NCheckbox>
            <br />
            <NCheckbox
              v-model:checked={
                this.currentConfig.enableIncrementalCompilation_doc
              }
            >
              增量编译文档，当需要重新全量编译文档时不勾选此项，需要上方选项勾选，此选项才能生效
            </NCheckbox>
            <NDivider />
            <h3>head</h3>
            此处的代码将添加至 head 标签顶部
            <NInput
              v-model:value={this.currentConfig.embedCode.head}
              type="textarea"
            ></NInput>
            <h3>beforeBody</h3>
            此处的代码将添加至 body 标签顶部
            <NInput
              v-model:value={this.currentConfig.embedCode.beforeBody}
              type="textarea"
            ></NInput>
            <h3>afterBody</h3>
            此处的代码将添加至 body 标签底部
            <NInput
              v-model:value={this.currentConfig.embedCode.afterBody}
              type="textarea"
            ></NInput>
          </NCollapseItem>
          <NCollapseItem title="CDN 配置" name="2">
            公共资源的cdn前缀
            <br />
            删除掉下方文本框内所有文本即关闭了此功能
            <br />
            <NInput
              v-model:value={this.currentConfig.cdn.siyuanPrefix}
              type="textarea"
              placeholder="公共资源的cdn前缀"
            />
          </NCollapseItem>
          <NCollapseItem title="S3 配置" name="3">
            OceanPress 的运算都是在本地，不会收集密钥，请确保网址是 https 加密的
            oceanpress.heartstack.space
            <br />
            {/* 推荐自身的技术支持服务 */}
            <NCheckbox v-model:checked={this.currentConfig.s3.enable}>
              启用 s3
            </NCheckbox>
            <NInput
              v-model:value={this.currentConfig.s3.region}
              placeholder="s3.region"
            />
            <NDivider />
            <NInput
              v-model:value={this.currentConfig.s3.bucket}
              placeholder="s3.bucket"
            />
            <NDivider />
            <NInput
              v-model:value={this.currentConfig.s3.pathPrefix}
              placeholder="s3.pathPrefix"
            />
            <NDivider />
            <NInput
              v-model:value={this.currentConfig.s3.endpoint}
              placeholder="s3.endpoint"
            />
            <NDivider />
            <NInput
              v-model:value={this.currentConfig.s3.accessKeyId}
              placeholder="s3.accessKeyId"
            />
            <NDivider />
            <NInput
              v-model:value={this.currentConfig.s3.secretAccessKey}
              type="password"
              placeholder="s3.secretAccessKey"
            />
          </NCollapseItem>
          <NCollapseItem title="meilisearch 配置" name="4">
            <NCheckbox v-model:checked={this.currentConfig.meilisearch.enable}>
              启用 meilisearch 搜索引擎
            </NCheckbox>
            <NDivider />
            <NInput
              v-model:value={this.currentConfig.meilisearch.host}
              placeholder="meilisearch.host"
            />
            <NDivider />
            <NInput
              v-model:value={this.currentConfig.meilisearch.apiKey}
              placeholder="meilisearch.apiKey"
            />
            <NDivider />
            <NInput
              v-model:value={this.currentConfig.meilisearch.indexName}
              placeholder="meilisearch.indexName"
            />
          </NCollapseItem>
        </NCollapse>
      </NStep>
    )
  },
})
