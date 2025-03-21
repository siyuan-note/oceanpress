import { Effect, Context } from 'effect'
import type { S_Node } from './siyuan_type.ts'

export type effectDepApi = {
  // 渲染相关
  getNodeByID: (id?: string) => Promise<S_Node | undefined>
  getDocPathBySY: (sy?: S_Node) => Promise<string | undefined>
  getDocByChildID: (id: string) => Promise<S_Node | undefined>
  getHPathByID_Node: (id_node: string | S_Node) => Promise<string>

  // 文件读写相关
  log: (msg: string) => void
  percentage: (_n: number) => void
}
export class EffectDep extends Context.Tag('EffectDep')<
  EffectDep,
  effectDepApi
>() {}
