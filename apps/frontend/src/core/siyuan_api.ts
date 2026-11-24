import { Ref } from 'vue'
import { currentConfig } from '~/core/config.ts'
import {
  PromiseObj,
  usePromiseComputed,
} from '../components/data_promise/index.ts'
import { S_Node, file, notebook } from './siyuan_type.ts'

/** oceanpress 所依赖的相关 api https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md */
export interface api {
  /**
   *  列出笔记本
   */
  notebook_lsNotebooks(): {
    notebooks: notebook[]
  }
  filetree_listDocsByPath(p: { notebook: notebook['id']; path: '/' }): {
    box: '20210816161940-zo21go1'
    files: file[]
    path: '/'
  }
  /** 执行 SQL 查询 https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md#执行-sql-查询 */
  query_sql(p: {
    /** SELECT * FROM blocks WHERE content LIKE'%content%' LIMIT 7 */ stmt: string
  }): any[]
  /** 获取文件 https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md#获取文件 */
  file_getFile(p: { path: string }): S_Node | ArrayBuffer
  get_assets(p: { path: string }): ArrayBuffer
  /** 根据人类可读路径获取 IDs https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md#根据人类可读路径获取-ids */
  filetree_getIDsByHPath(p: {
    /** /foo/bar */
    path: string
    /** 20210808180117-czj9bvb */
    notebook: string
  }): string[]
  /** 渲染数据库（属性视图）为表格 https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md#渲染属性视图 */
  av_renderAttributeView(p: { id: string }): AV_RenderResult
}
/** 数据库渲染结果中的单元格值，思源按列类型只填充其中一个字段 */
type AV_CellValue = {
  type?: string
  isNotEmpty?: boolean
  text?: { content?: string }
  number?: { content?: number }
  date?: { content?: number; isNotEmpty?: boolean }
  select?: { content?: string }
  mSelect?: { content?: string }[]
  url?: { content?: string }
  block?: { content?: string; id?: string }
  email?: { content?: string }
  phone?: { content?: string }
  mAsset?: { content?: string; name?: string }[]
  checkbox?: { checked?: boolean }
}
/** 思源 v3.8 起 columns/rows 位于 view 下，顶层只保留视图清单与当前视图 id */
type AV_RenderResult = {
  name: string
  viewType: string
  viewID: string
  views: { id: string; name: string; type: string }[]
  view: {
    id: string
    name: string
    type: string
    /** 当前视图下可见的列（已按视图配置过滤隐藏列） */
    columns: { id: string; name: string; type: string; align?: string; pin?: boolean }[]
    rows: { id: string; cells: { id: string; value?: AV_CellValue }[] }[]
  }
}
type apiPromisify = {
  readonly [K in keyof api]: (
    ...arg: Parameters<api[K]>
  ) => Promise<unPromise<ReturnType<api[K]>>>
}

/** 解开 promise 类型包装 */
declare type unPromise<T> = T extends Promise<infer R> ? R : T
let rpcCount = 0

/** 远程思源在高并发下会偶发返回 502 / 空响应体（网关扛不住瞬时并发）。
 * 单个资源串行请求永远正常，所以对这类瞬时故障做有限次指数退避重试，
 * 而不是直接崩溃或静默产出 0 字节文件。 */
const MAX_RETRY = 4
/** 判定一次响应是否属于可重试的瞬时故障：502/503/504 或空响应体 */
function isTransientFailure(status: number, byteLength: number) {
  return status === 502 || status === 503 || status === 504 || byteLength === 0
}
/** 指数退避等待：第 n 次重试等待 100ms * 2^(n-1) */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function rpc(method: string, arg: any) {
  const apiPrefix = currentConfig.value.apiPrefix
  const Authorization = currentConfig.value.authorized
  rpcCount++

  if (method === 'get_assets') {
    /** 资源文件路径，用于出错时定位 */
    const assetPath = arg[0].path as string
    for (let attempt = 0; ; attempt++) {
      const r = await fetch(`${apiPrefix}/${assetPath}`, {
        headers: {
          Authorization: `Token ${Authorization}`,
        },
        body: null,
        method: 'GET',
        mode: 'cors',
      })
      const buffer = await r.arrayBuffer()
      if (isTransientFailure(r.status, buffer.byteLength)) {
        if (attempt < MAX_RETRY) {
          await delay(100 * 2 ** attempt)
          continue
        }
        /** 重试耗尽仍失败，给出可读错误并让上层崩溃——绝不静默产出 0 字节文件 */
        throw new Error(
          `获取思源资源失败，重试 ${MAX_RETRY} 次仍异常。path=${assetPath} status=${r.status} content-type=${r.headers.get('content-type')} bodyLen=${buffer.byteLength}`,
        )
      }
      return buffer
    }
  }
  if (method === 'file_getFile') {
    const path = arg[0].path as string
    /** file_getFile 走自己的重试循环：远程思源高并发下会偶发 502/空响应，
     *  与 get_assets 同源问题，统一用指数退避重试消化。 */
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(`${apiPrefix}/api/${method.replace(/_/g, '/')}`, {
        headers: {
          Authorization: `Token ${Authorization}`,
        },
        body: JSON.stringify(arg[0]),
        method: 'POST',
      }).catch((err: Error) => {
        /** 网络层错误（连接被重置等）也属于可重试的瞬时故障 */
        err.message = `访问思源接口时出错了，请检查思源服务是否启动以及配置接口地址是否正确。path=${path}`
        throw err
      })
      if (path.endsWith('.sy')) {
        const text = await res.text()
        if (isTransientFailure(res.status, text.length)) {
          if (attempt < MAX_RETRY) {
            await delay(100 * 2 ** attempt)
            continue
          }
          throw new Error(
            `获取思源文档失败，重试 ${MAX_RETRY} 次仍异常。path=${path} status=${res.status} content-type=${res.headers.get('content-type')} bodyLen=${text.length}`,
          )
        }
        try {
          return JSON.parse(text)
        } catch (e) {
          if (attempt < MAX_RETRY) {
            /** 解析失败也可能是响应被截断，值得重试 */
            await delay(100 * 2 ** attempt)
            continue
          }
          throw new Error(
            `解析思源文档 .sy 失败，响应体不是合法 JSON。path=${path} status=${res.status} content-type=${res.headers.get('content-type')} bodyLen=${text.length} bodyHead=${text.slice(0, 120)}`,
          )
        }
      } else {
        const buffer = await res.arrayBuffer()
        if (isTransientFailure(res.status, buffer.byteLength)) {
          if (attempt < MAX_RETRY) {
            await delay(100 * 2 ** attempt)
            continue
          }
          throw new Error(
            `获取思源文件失败，重试 ${MAX_RETRY} 次仍异常。path=${path} status=${res.status} content-type=${res.headers.get('content-type')} bodyLen=${buffer.byteLength}`,
          )
        }
        if (buffer.byteLength < 200) {
          const decoder = new TextDecoder()
          const text = decoder.decode(buffer)
          /** 空响应体已由 isTransientFailure 处理；到这里是非空小体积，尝试解析 404 */
          try {
            if (JSON.parse(text).code === 404) {
              throw new Error(`文件不存在: ${path}`)
            }
          } catch (e) {
            if (e instanceof Error && e.message.startsWith('文件不存在')) throw e
            throw new Error(
              `获取思源文件失败，小体积响应体不是合法 JSON。path=${path} status=${res.status} bodyLen=${text.length} bodyHead=${text.slice(0, 120)}`,
            )
          }
        }
        return buffer
      }
    }
  }
  const res = await fetch(`${apiPrefix}/api/${method.replace(/_/g, '/')}`, {
    headers: {
      Authorization: `Token ${Authorization}`,
    },
    body: JSON.stringify(arg[0]),
    method: 'POST',
  }).catch((err: Error) => {
    err.message = `访问思源接口时出错了，请检查思源服务是否启动以及配置接口地址是否正确。`
    throw err
  })
  const jsonRaw = await res.text()
  let json: any
  try {
    json = JSON.parse(jsonRaw)
  } catch (e) {
    throw new Error(
      `解析思源接口响应失败，响应体不是合法 JSON。method=${method} status=${res.status} bodyLen=${jsonRaw.length} bodyHead=${jsonRaw.slice(0, 120)}`,
    )
  }

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
