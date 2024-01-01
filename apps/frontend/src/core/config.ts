import { storeDep } from '~/core/dependency.ts'
import { deepAssign } from '~/util/deep_assign.ts'
import { computed, reactive, watch } from 'vue'
import { notebook } from './siyuan_type.ts'
import { version } from '~/../package.json'
/** 不要在运行时修改这个对象，他只应该在代码中配置 */
const defaultConfig = {
  name: 'default',
  /** 需要编译的笔记本 */
  notebook: {} as notebook,
  /** 思源的鉴权key */
  authorized: '',
  /** 思源的api服务地址 */
  apiPrefix: 'http://127.0.0.1:6806',
  /** 打包成 zip */
  compressedZip: true,
  /** 不将 publicZip 打包到 zip 包中 */
  withoutPublicZip: true,
  /** 不复制 assets/ ，勾选此选项则需要自行处理资源文件 */
  excludeAssetsCopy: false,
  /** 输出站点地图相关 */
  sitemap: {
    /** 控制是否输出 sitemap.xml,不影响 rss 选项 */
    enable: true,
    /** 默认为 "." 生成路径例如 "./record/思源笔记.html"
     * 但 sitemap 并不建议采用相对路径所以应该替换成例如 "https://shenzilong.cn"
     * 则会生成 "https://shenzilong.cn/record/思源笔记.html" 这样的绝对路径
     * 参见 https://www.sitemaps.org/protocol.html#escaping
     */
    sitePrefix: '.',
    /** 站点地址 */
    siteLink: '',
    /** 站点描述 */
    description: '',
    /** 站点标题 */
    title: '',
    /** 开启 rss 生成，对于文件名为 .rss.xml 结尾的文档生效 */
    rss: true,
  },
  /** 开启增量编译，当开启增量编译时，
   * 在编译过程中会依据 __skipBuilds__ 的内容来跳过一些没有变化不需要重新输出的内容
   */
  enableIncrementalCompilation: false,
  /**
   * 要全量编译文档时将此选项设置为false，当OceanPress版本和上次编译时不同时会忽略此属性全量编译文档
   */
  enableIncrementalCompilation_doc: true,
  /** 跳过编译的资源 */
  __skipBuilds__: {} as {
    [id: string]:
      | {
          hash?: string
          /** 此文档正向引用的其他文档的id */ refs?: string[]
          /** 挂件快照的更新时间 */ updated?: string
        }
      | undefined
  },

  cdn: {
    /** 思源 js、css等文件的前缀 */
    siyuanPrefix:
      'https://fastly.jsdelivr.net/gh/siyuan-note/oceanpress@v0.0.7/apps/frontend/public/notebook/',
    /** 思源 js、css等文件zip包地址  */
    publicZip:
      'https://fastly.jsdelivr.net/gh/siyuan-note/oceanpress@v0.0.7/apps/frontend/public/public.zip',
  },
  /** s3 上传配置
   * https://help.aliyun.com/zh/oss/developer-reference/use-amazon-s3-sdks-to-access-oss#section-2ri-suq-pb3
   */
  s3: {
    enable: false,
    bucket: '',
    region: '',
    pathPrefix: '',
    endpoint: '',
    accessKeyId: '',
    secretAccessKey: '',
  },
  meilisearch: {
    enable: false,
    host: '',
    apiKey: '',
    indexName: '',
  },
  /** html模板嵌入代码块，会将此处配置中的代码嵌入到生成的html所对应的位置 */
  embedCode: {
    head: '',
    beforeBody: '',
    afterBody: `<footer>
<p style="text-align:center;margin:15px 0;">
  技术支持：
  <a target="_blank" href="https://github.com/2234839/oceanPress_js">OceanPress</a> |
  开发者：
  <a target="_blank" href="https://heartstack.space/user/%E5%AD%90%E8%99%9A/posts">崮生（子虚）</a>
</p>
</footer>`,
  },
  OceanPress: {
    /** 此配置文件编译时的版本 */
    version: version,
  },
}
export type Config = typeof defaultConfig
export const configs = reactive({
  /** 当前所使用的配置项的 key */
  __current__: 'default' as const,
  /** 为true是表示是代码中设置的默认值，不会保存到本地，避免覆盖之前保存的数据，在加载本地配置后会自动修改为false */
  __init__: true,
  default: deepAssign<typeof defaultConfig>({}, defaultConfig),
})

export function addConfig(name: string, value?: typeof defaultConfig) {
  configs[name as 'default'] = deepAssign<typeof defaultConfig>(
    {},
    value ?? defaultConfig,
  )
}
/** 加载配置文件 */
export const loadConfigFile = (c?: typeof configs) => {
  if (c) {
    deepAssign(configs, c)
  } else {
    const localConfig = storeDep.getItem('configs')
    if (localConfig) {
      /** 从本地存储加载配置 */
      deepAssign(configs, JSON.parse(localConfig))
    }
  }

  Object.entries(configs)
    .filter(([key]) => key.startsWith('__') === false)
    .forEach(([_key, obj]) => {
      /** 将新增配置项更新到旧配置上 */
      deepAssign(obj, defaultConfig, { update: false, add: true })
    })
}
export const currentConfig = computed(() => configs[configs.__current__])

export const saveConfig = () => {
  if (configs.__init__ === false)
    storeDep.setItem('configs', JSON.stringify(configs, null, 2))
}

let timer: ReturnType<typeof setTimeout> | null = null
/** 防抖的保存配置 */
export const debounceSaveConfig = () => {
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    saveConfig()
    timer = null
  }, 700)
}
watch(configs, debounceSaveConfig, { deep: true })

configs.__init__ = false

/** 浏览器环境下，直接尝试加载配置 */
if (globalThis.document) {
  loadConfigFile()
}
