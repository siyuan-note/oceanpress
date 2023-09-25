/** ════════════════════════🏳‍🌈 处理sy节点相关 🏳‍🌈════════════════════════
 *
 ** ════════════════════════🚧 处理sy节点相关 🚧════════════════════════ */

import { API } from "./siyuan_api";
import { S_Node } from "./siyuan_type";

/** 在 getSyByPath 函数中管理 */
const allDocSY = new Map</** 文件路径.sy */ string, S_Node>();
/** 在 node 函数中管理 */
const id_Node = new Map</** id */ string, S_Node>();

/** 文件路径.sy */
export function getDocPathBySY(sy?: S_Node) {
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
    return getDocByChildID(node.Parent.ID);
  }
}
/** @returns /测试/布局/flex */
export function getHPathByID_Node(id_node: string | S_Node) {
  const doc = getDocByChildID(typeof id_node === "string" ? id_node : id_node.ID!);
  const path = getDocPathBySY(doc)!;
  const r = path.matchAll(/\d{14}-[0-9a-zA-Z]+/g);
  /** 第一个是 笔记本 的id，跳过不用  */
  r.next();
  const hpath =
    "/" +
    [...r]
      .map(([id]) => {
        const title = getDocByChildID(id)?.Properties?.title;
        if (title === undefined) {
          throw `无法设置空路径 ${id}`;
        }
        return title;
      })
      .join("/");

  return hpath;
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
