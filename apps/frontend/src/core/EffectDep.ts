import { Effect, Context } from 'effect'
import type { S_Node } from './siyuan_type.ts'

export type renderApi = {
  getNodeByID: (id?: string) => Promise<S_Node | undefined>
  getDocPathBySY: (sy?: S_Node) => Promise<string | undefined>
  getDocByChildID: (id: string) => Promise<S_Node | undefined>
  getHPathByID_Node: (id_node: string | S_Node) => Promise<string>
}
export class RenderApi extends Context.Tag('render_api')<
  RenderApi,
  renderApi
>() {}

export class BuildEffect extends Context.Tag('BuildEffect')<
  BuildEffect,
  {
    log: (msg: string) => void
    percentage: (_n: number) => void
  }
>() {}
