/** ════════════════════════🏳‍🌈 处理sy节点相关 🏳‍🌈════════════════════════
 *
 ** ════════════════════════🚧 处理sy节点相关 🚧════════════════════════ */

import { API } from "./siyuan_api";
import { S_Node } from "./siyuan_type";

/** 在 getSyByPath 函数中管理 */
const allDocSY = new Map</** 文件路径.sy */ string, S_Node>();
/** 在 node 函数中管理 */
const id_Node = new Map</** id */ string, S_Node>();
export function getDocPathBySY(sy: S_Node) {
  for (const [path, SY] of allDocSY) {
    if (SY === sy) {
      return path;
    }
  }
}
export async function getSyByPath(path: string) {
  if (allDocSY.has(path)) return allDocSY.get(path)!;
  const sy = (await API.file_getFile({
    path,
  })) as S_Node;
  allDocSY.set(path, sy);
  return node(sy);
}
export function getNodeByID(id?: string) {
  if (id === undefined) return undefined;
  return id_Node.get(id);
}
export function getDocByChildID(id: string) {
  const node = getNodeByID(id);
  if (node === undefined) {
    return undefined;
  } else if (node.Type === "NodeDocument") {
    return node;
  } else if (node.Parent?.ID === undefined) {
    return undefined;
  } else {
    return getDocByChildID(node.Parent?.ID);
  }
}

/** 处理一个原始的 sy 根节点 */
function node(sy: S_Node) {
  // 递归遍历 sy
  if (sy.ID) {
    id_Node.set(sy.ID, sy);
  }
  for (const child of sy?.Children ?? []) {
    /** 附加 Parent 指向 */
    child.Parent = sy;
    node(child);
  }
  return sy;
}
