/** ════════════════════════🏳‍🌈 处理sy节点相关 🏳‍🌈════════════════════════
 *
 ** ════════════════════════🚧 处理sy节点相关 🚧════════════════════════ */

import { API } from "./siyuan_api";
import { S_Node } from "./siyuan_type";

const allSY = new Map</** 文件路径.sy */ string, S_Node>();
const id_Node = new Map</** id */ string, S_Node>();

export async function getSyByPath(path: string) {
  if (allSY.has(path)) return allSY.get(path)!;
  const sy = await API.file_getFile({
    path,
  });
  return node(sy);
}
export function getNodeByID(id: string) {
  return id_Node.get(id);
}
export function getDocByChildID(id: string) {
  const node = getNodeByID(id);
  if (node === undefined) {
    return undefined;
  } else if ((node.Type = "NodeDocument")) {
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
  } else if (sy?.Children) {
    for (const child of sy.Children) {
      /** 附加 Parent 指向 */
      child.Parent = sy;
      node(child);
    }
  }
  return sy;
}
