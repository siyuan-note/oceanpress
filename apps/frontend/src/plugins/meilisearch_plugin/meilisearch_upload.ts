import { Meilisearch, Index } from 'meilisearch'
import { OceanPressPlugin } from '~/core/ocean_press.ts'
import { load } from 'cheerio'
type doc = {
  id: string
  title?: string
  content: string
  url: string
  lvl0?: string
  lvl1?: string
  lvl2?: string
  lvl3?: string
  lvl4?: string
  lvl5?: string
  lvl6?: string
}
export class MeilisearchPlugin implements OceanPressPlugin {
  _melisearch: Meilisearch | undefined
  _index: Index | undefined
  _indexName: string
  host: string
  apiKey: string
  constructor(option: { host: string; apiKey: string; indexName: string }) {
    this.host = option.host
    this.apiKey = option.apiKey
    this._indexName = option.indexName
  }
  async _getMeliSearch() {
    if (this._melisearch === undefined) {
      this._melisearch = new Meilisearch({
        host: this.host,
        apiKey: this.apiKey,
      })
    }
    return this._melisearch!
  }
  async _getIndex() {
    if (this._index === undefined) {
      const meilisearch = await this._getMeliSearch()
      this._index = meilisearch.index(this._indexName)
    }
    return this._index!
  }
  docs: { [id: string]: doc } = {}
  async addDocument(doc: doc) {
    this.docs[doc.id] = doc
  }
  async updateDocument() {
    console.log(`开始上传数据到 ${this.host}`)
    const index = await this._getIndex()
    const res = await index.addDocuments(Object.values(this.docs))
    console.log(`上传结果`, res)
  }
  build_onFileTree: OceanPressPlugin['build_onFileTree'] = (c, next) => {
    const [tree] = c
    console.log('开始生成 meilisearch 所需数据结构')

    const htmlTree = Object.keys(tree)
      .filter((path) => path.endsWith('.html'))
      .map((path) => [path, tree[path]] as const)
    for (const [path, html] of htmlTree) {
      const $ = load(html.toString())
      const entries = $('.h1,.h2,.h3,.h4,.h5,.h6,.p').toArray()
      const level: Record<string, string> = { lvl0: $('title').text() }
      for (const el of entries) {
        /** h1~h6、p */
        const c = el.attribs.class
        if (c !== 'p') {
          Object.keys(level).forEach((lv) => {
            if (lv.substring(3, 4) > c.substring(1, 2)) {
              /** 跳出层级 */
              delete level[lv]
            }
          })
          /** 进入层级 */
          level[`lvl${c.substring(1, 2)}`] = $(el).text()
        }
        this.addDocument({
          id: el.attribs.id,
          content: $(el).text(),
          url: `${path}#${el.attribs.id}`,
          ...level,
        })
      }

      if (path.endsWith('index.html')) break
    }
    this.updateDocument()
    return next(...c)
  }
}
