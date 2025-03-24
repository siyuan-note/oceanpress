import { Context } from 'effect'
import type { S_Node } from './siyuan_type.ts'
import type { Config } from './config.ts'

export type EffectRenderApi = {
  // 渲染相关
  getNodeByID: (id?: string) => Promise<S_Node | undefined>
  getDocPathBySY: (sy?: S_Node) => Promise<string | undefined>
  getDocByChildID: (id: string) => Promise<S_Node | undefined>
  getHPathByID_Node: (id_node: string | S_Node) => Promise<string>
}
export class EffectRender extends Context.Tag('EffectDep')<
  EffectRender,
  EffectRenderApi
>() {}

// 读写配置文件所依赖的副作用
export type effectLocalStorage = {
  setItem: (key: string, value: string) => void
  getItem: (key: string) => string | undefined
}

export class EffectLocalStorageDep extends Context.Tag('EffectLocalStorageDep')<
  EffectLocalStorageDep,
  effectLocalStorage
>() {}

// 读写配置文件所依赖的副作用
export type effectLog = {
  // 进度输出相关
  log: (msg: string) => void
  percentage: (_n: number) => void
}

export class EffectLogDep extends Context.Tag('EffectLogDep')<
  EffectLogDep,
  effectLog
>() {}

export class EffectConfigDep extends Context.Tag('EffectConfigDep')<
  EffectConfigDep,
  Config
>() {}
