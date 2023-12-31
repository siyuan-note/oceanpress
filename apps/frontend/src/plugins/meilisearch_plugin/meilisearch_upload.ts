import { Meilisearch, Index } from 'meilisearch'
import { OceanPressPlugin } from '~/core/ocean_press.ts'

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
  async addDocument() {
    const index = await this._getIndex()
    await index.addDocuments([
      {
        id: 'test',
        title: '标题名啊',
        content: '内容啊',
        url: '/崮生',
        lvl0: '笔记',
      },
      {
        id: 'test2',
        title: 'test2',
        content: 'test2',
        url: '/test2',
        lvl0: '笔记',
        lvl1: '测试',
      },
      {
        id: 'test3',
        title: 'test2',
        content: 'test2',
        url: '/test2',
        lvl0: '笔记',
        lvl1: '测试',
        lvl3: '测试lvl3',
      },
    ])
  }
  build_renderHTML: OceanPressPlugin['build_renderHTML'] = async (c, next) => {
    console.log(`${this._indexName} 插件拦截成功`, c[0]?.ID)
    // 在这里上传数据到搜索引擎，并且可以添加对应的js代码引入
    return next(...c)
  }
}
