/** ════════════════════════🏳‍🌈 处理sy节点相关 🏳‍🌈════════════════════════ */

import { S_Node } from './siyuan_type.ts'

/** 为 children 节点附加 Parent 引用  */
export function parentRef(sy: S_Node) {
  for (const child of sy?.Children ?? []) {
    child.Parent = sy
    parentRef(child)
  }
  return sy
}
