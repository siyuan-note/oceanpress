import { get_block_by_id, get_doc_by_child_id } from './cache.ts'
import { DB_block_path, type S_Node } from './siyuan_type.ts'

export const renderApiDep = {
  getDocByChildID: async (id: string) => {
    return await get_doc_by_child_id(id)
  },

  getDocPathBySY: async (sy?: S_Node) => {
    if (sy?.ID) {
      const block = await get_block_by_id(sy.ID)
      if (block) {
        return DB_block_path(block)
      }
    }
  },

  /** TODO 应该可以从cache中获取，而不需要查询 */
  getHPathByID_Node: async (id_node: string | S_Node): Promise<string> => {
    const id = typeof id_node === 'string' ? id_node : id_node.ID
    if (id === undefined) throw new Error('id is undefined')
    const docNode = await get_doc_by_child_id(id)
    if (docNode === undefined) throw new Error('docNode is undefined')
    const docBlock = await get_block_by_id(id)
    if (docBlock === undefined) throw new Error('docBlock is undefined')
    return docBlock.hpath
  },

  getNodeByID: async (id?: string): Promise<S_Node | undefined> => {
    if (id === undefined) return
    const doc = await renderApiDep.getDocByChildID(id)
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
  },
}
