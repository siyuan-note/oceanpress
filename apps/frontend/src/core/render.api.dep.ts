import { storeDep } from '@/dependency'
import { API } from './siyuan_api'
import { DB_block, DB_block_path, S_Node } from './siyuan_type'

storeDep.getDocByChildID = async (id: string) => {
  const docBlock = await get_doc_by_child_id(id)
  if (docBlock === undefined) return
  return (await API.file_getFile({
    path: DB_block_path(docBlock),
  })) as S_Node
}

storeDep.getDocPathBySY = async (sy?: S_Node) => {
  if (sy?.ID) {
    const block = await get_block_by_id(sy.ID)
    if (block) {
      return DB_block_path(block)
    }
  }
}

storeDep.getHPathByID_Node = async (
  id_node: string | S_Node,
): Promise<string> => {
  const id = typeof id_node === 'string' ? id_node : id_node.ID
  if (id === undefined) throw new Error('id is undefined')
  const docBlock = await get_doc_by_child_id(id)
  if (docBlock === undefined) throw new Error('docBlock is undefined')
  return docBlock.hpath
}

storeDep.getNodeByID = async (id?: string): Promise<S_Node | undefined> => {
  if (id === undefined) return
  const doc = await storeDep.getDocByChildID(id)
  if (doc === undefined) return
  return getNode(doc)
  function getNode(node: S_Node): S_Node | undefined {
    if (node.ID === id) return node
    if (node.Children === undefined) return
    for (const child of node.Children) {
      const n = getNode(child)
      if (n) return n
    }
  }
}
async function get_doc_by_child_id(id: string): Promise<DB_block | undefined> {
  const r = await get_block_by_id(id)
  if (r === undefined) return
  if (r.id === r.root_id) return r

  return await get_block_by_id(r.root_id)
}
async function get_block_by_id(id: string) {
  const blocks = (await API.query_sql({
    stmt: `
        SELECT * from blocks
        WHERE id = '${id}'
      `,
  })) as DB_block[]
  if (blocks.length === 0) {
    return
  }
  return blocks[0]
}
