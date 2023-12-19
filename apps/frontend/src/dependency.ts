import { S_Node } from './core/siyuan_type'

/** 默认填充函数，不应当被调用 */
const nullDep: any = () => {
  throw new Error('不可调用未填充的依赖')
}

/** ════════════════════════🏳‍🌈 全局依赖 🏳‍🌈════════════════════════
 *  供不同入口注入不同依赖实现
 ** ════════════════════════🚧 全局依赖 🚧════════════════════════ */
export const storeDep = {
  // 读写配置文件所依赖的副作用
  setItem: nullDep as (key: string, value: string) => void,
  getItem: nullDep as (key: string) => string | undefined,

  // render功能依赖的副作用
  getNodeByID: nullDep as (id?: string) =>  Promise<S_Node | undefined>,
  getDocPathBySY: nullDep as (sy?: S_Node) => Promise<string | undefined>,
  getDocByChildID: nullDep as (id: string) => Promise<S_Node | undefined>,
  getHPathByID_Node: nullDep as (id_node: string | S_Node) => Promise<string>,
  sy_refs_add: nullDep as (sy: S_Node, ref: string) => void,
}
