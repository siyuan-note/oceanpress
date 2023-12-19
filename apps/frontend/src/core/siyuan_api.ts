import { Ref } from 'vue'
import { PromiseObj, usePromiseComputed } from '../components/data_promise'
import { NodeDocument, S_Node, file, notebook } from './siyuan_type'
import { currentConfig } from '@/config'

/** https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md */
export interface api {
  /**
   *  列出笔记本
   */
  notebook_lsNotebooks(): {
    notebooks: notebook[]
  }
  block_getBlockInfo(p: { id: string }): {
    box: '20210816161940-zo21go1'
    path: '/20201104153359-sk9a3yg.sy'
    rootChildID: '20201104153359-sk9a3yg'
    rootID: '20201104153359-sk9a3yg'
    rootIcon: ''
    rootTitle: 'markdown'
  }
  filetree_listDocsByPath(p: { notebook: notebook['id']; path: '/' }): {
    box: '20210816161940-zo21go1'
    files: file[]
    path: '/'
  }
  filetree_getHPathByID(p: { id: file['id'] }): '/foo/bar'
  filetree_getDoc(p: {
    id: file['id']
    isBacklink: false
    mode: 0
    size: 48
  }): NodeDocument
  export_exportHTML(p: {
    id: file['id']
    pdf: false
    /** 为空时思源不会写文件 https://github.com/siyuan-note/siyuan/blob/master/kernel/model/export.go ：ExportHTML */
    savePath: ''
  }): {
    content: '<html>'
    id: '20200825162036-4dx365o'
    name: '排版元素'
  }
  query_sql(p: {
    /** SELECT * FROM blocks WHERE content LIKE'%content%' LIMIT 7 */ stmt: string
  }): any[]
  /** 获取文件 https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md#获取文件
   */
  file_getFile(p: { path: string }): S_Node | ArrayBuffer
  get_assets(p: { path: string }): ArrayBuffer
  /** 根据人类可读路径获取 IDs https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md#根据人类可读路径获取-ids */
  filetree_getIDsByHPath(p: {
    /** /foo/bar */
    path: string
    /** 20210808180117-czj9bvb */
    notebook: string
  }): string[]
}
type apiPromisify = {
  readonly [K in keyof api]: (
    ...arg: Parameters<api[K]>
  ) => Promise<unPromise<ReturnType<api[K]>>>
}

/** 解开 promise 类型包装 */
declare type unPromise<T> = T extends Promise<infer R> ? R : T

async function rpc(method: string, arg: any) {
  const apiPrefix = currentConfig.value.apiPrefix
  const Authorization = currentConfig.value.authorized

  if (method === 'get_assets') {
    return fetch(`${apiPrefix}/${arg[0].path}`, {
      headers: {
        Authorization: `Token ${Authorization}`,
      },
      body: null,
      method: 'GET',
      mode: 'cors',
    }).then((r) => r.arrayBuffer())
  }
  const res = await fetch(`${apiPrefix}/api/${method.replace(/_/g, '/')}`, {
    headers: {
      Authorization: `Token ${Authorization}`,
    },
    body: JSON.stringify(arg[0]),
    method: 'POST',
  }).catch((err: Error) => {
    err.message = `访问思源接口时出错了，请检查思源服务是否启动`
    throw err
  })
  if (method === 'file_getFile') {
    const path = arg[0].path as string
    if (path.endsWith('.sy')) {
      return await res.json()
    } else {
      const buffer = await res.arrayBuffer()
      if (buffer.byteLength < 200) {
        const decoder = new TextDecoder()
        const text = decoder.decode(buffer)
        if (JSON.parse(text).code === 404) {
          throw new Error(`文件不存在: ${path}`)
        }
      }
      return buffer
    }
  }
  const json = await res.json()

  if (json.code !== 0) {
    throw new Error(json.msg)
  }
  return json.data
}

/** 包装了一次的 RC 方便跳转到函数定义  */
export const API = new Proxy(
  {},
  {
    get(_, method: string) {
      return (...arg: any) => rpc(method, arg)
    },
  },
) as apiPromisify

type vApi = {
  readonly [K in keyof api]: (
    ...arg: Parameters<api[K]>
  ) => Ref<PromiseObj<unPromise<ReturnType<api[K]>>, Error>>
}
/** 使用 usePromiseComputed 包装的方法，便于使用  */
export const vApi = new Proxy(
  {},
  {
    get(_, method: string) {
      return (...arg: any) => usePromiseComputed.fn(() => rpc(method, arg))
    },
  },
) as vApi
