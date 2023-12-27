/** ════════════════════════🏳‍🌈 cache 🏳‍🌈════════════════════════
 *  对于思源内核 api 的调用存到内存，通过快取技术避免重复请求和没有必要的请求，加速程序运行速度，但这可能会导致数据不是最新的
 ** ════════════════════════🚧 cache 🚧════════════════════════ */

import { API } from './siyuan_api.ts'
import { DB_block, DB_block_path, S_Node } from './siyuan_type.ts'

let cache = true
/** 控制是否启用快取功能 */
export function setCache(b: boolean) {
  cache = b
}

/** sql->查询结果 */
const sqlCacheMap = new Map<string, any>()
/** hpath->S_Node文档节点 */
const hpathCacheMap = new Map<string, S_Node>()
/** id->S_Node */
const idCacheMap = new Map</** id */ string, S_Node>()
/** id->DB_block */
const blockCacheMap = new Map</** id */ string, DB_block>()

export async function getIDsByHPath(p: {
  path: string
  notebook: string
}): Promise<string[]> {
  if (cache && hpathCacheMap.has(p.path)) {
    const id = hpathCacheMap.get(p.path)?.ID
    // TODO 也许会有重复hpath这里暂不考虑
    return id ? [id] : []
  }
  const ids = await API.filetree_getIDsByHPath(p)
  return ids
}

/** 设置快取 sqlCacheMap */
export async function query_sql(stmt: string): Promise<any> {
  if (cache && sqlCacheMap.has(stmt)) {
    return sqlCacheMap.get(stmt)
  }
  const res = await API.query_sql({
    stmt,
  })
  if (cache) {
    sqlCacheMap.set(stmt, res)
  }
  return res
}

/** 设置快取 hpathCacheMap idCacheMap */
export async function get_doc_by_hpath(hpath: string): Promise<S_Node> {
  if (cache) {
    const c = hpathCacheMap.get(hpath)
    if (c) return c
  }
  const docBlock = (
    (await query_sql(
      `SELECT * FROM blocks WHERE hpath = '${hpath}'`,
    )) as DB_block[]
  )[0]
  if (docBlock === undefined) throw new Error(`not doc by:${hpath}`)
  const res = await get_doc_by_SyPath(DB_block_path(docBlock))
  if (cache) {
    hpathCacheMap.set(hpath, res)
  }
  return res
}
/** 设置快取 idCacheMap */
export async function get_doc_by_SyPath(path: string): Promise<S_Node> {
  const res = parentRef(
    (await API.file_getFile({
      path,
    })) as S_Node,
  )
  if (cache) {
    idCache(res)
  }
  return res
}

export async function get_block_by_id(id: string) {
  if (cache) {
    const block = blockCacheMap.get(id)
    if (block) return block
  }
  const blocks = (await query_sql(`
          SELECT * from blocks
          WHERE id = '${id}'
        `)) as DB_block[]
  if (blocks.length === 0) {
    return
  }
  if (cache) blockCacheMap.set(id, blocks[0])
  return blocks[0]
}
export async function get_node_by_id(id?: string) {
  if (id === undefined) return
  if (cache) {
    const node = idCacheMap.get(id)
    if (node) return node
  }
  const doc = await get_doc_by_child_id(id)
  if (doc === undefined) return
  return findNode(doc)

  function findNode(node: S_Node): S_Node | undefined {
    if (node.ID === id) return node
    if (node.Children) {
      return node.Children.find((child) => findNode(child))
    }
  }
}
/** set blockCacheMap*/
// TODO 需要更换成能够完全遍历一个笔记本的写法
export async function allDocBlock_by_bookId(id: string) {
  const res = (await query_sql(`
    SELECT * from blocks
    WHERE box = '${id}'
        AND type = 'd'
    limit 150000 OFFSET 0
  `)) as DB_block[]
  if (cache) {
    res.forEach((block) => blockCacheMap.set(block.id, block))
  }
  return res
}

export async function get_doc_by_child_id(
  id: string,
): Promise<S_Node | undefined> {
  if (cache) {
    const child = idCacheMap.get(id)
    if (child) {
      let node = child
      while (true) {
        if (node.Type === 'NodeDocument') {
          return node
        } else if (node === undefined) {
          break
        }
        node = node.Parent
      }
    }
  }
  const block = await get_block_by_id(id)
  if (block === undefined) return
  return await get_doc_by_hpath(block.hpath)
}

function idCache(node: S_Node) {
  if (node.ID) {
    idCacheMap.set(node.ID, node)
  }
  if (node.Children) {
    node.Children.forEach(idCache)
  }
}

/** 为 children 节点附加 Parent 引用  */
export function parentRef(sy: S_Node) {
  for (const child of sy?.Children ?? []) {
    child.Parent = sy
    parentRef(child)
  }
  return sy
}
