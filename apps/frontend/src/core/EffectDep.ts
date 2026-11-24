import { Context } from 'effect'
import type { DB_block, S_Node } from './siyuan_type.ts'
import type { Config } from './config.ts'

export type EffectRenderApi = {
  // 渲染相关
  getNodeByID: (id?: string) => Promise<S_Node | undefined>
  getDocPathBySY: (sy?: S_Node) => Promise<string | undefined>
  getDocByChildID: (id: string) => Promise<S_Node | undefined>
  getHPathByID_Node: (id_node: string | S_Node) => Promise<string>
  /** 按 id 查块索引行（含所属笔记本 box），不存在返回 undefined */
  getBlockByID: (id: string) => Promise<DB_block | undefined>
}
export class EffectRender extends Context.Service<
  EffectRender,
  EffectRenderApi
>()('EffectDep') {}

// 读写配置文件所依赖的副作用
export type effectLocalStorage = {
  setItem: (key: string, value: string) => void
  getItem: (key: string) => string | undefined
}

export class EffectLocalStorageDep extends Context.Service<
  EffectLocalStorageDep,
  effectLocalStorage
>()('EffectLocalStorageDep') {}

// 读写配置文件所依赖的副作用
export type effectLog = {
  // 进度输出相关
  log: (msg: string) => void
  percentage: (_n: number) => void
}

export class EffectLogDep extends Context.Service<
  EffectLogDep,
  effectLog
>()('EffectLogDep') {}

export class EffectConfigDep extends Context.Service<
  EffectConfigDep,
  Config
>()('EffectConfigDep') {}
