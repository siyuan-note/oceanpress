/** ════════════════════════🏳‍🌈 处理sy节点相关 🏳‍🌈════════════════════════
 *
 ** ════════════════════════🚧 处理sy节点相关 🚧════════════════════════ */

import { API } from "./siyuan_api";
import { DB_block, DB_block_path, S_Node } from "./siyuan_type";

/** 在 getSyByPath 函数中管理 */
const allDocSY: {
  [id: string]: {
    node: S_Node;
    block: DB_block;
    /** 标注当前文档正向引用哪些文档 */ forwardReference: [];
  };
} = {};
/** 在 node 函数中管理 */
const id_Node = new Map</** id */ string, S_Node>();

/** 文件路径.sy */
export function getDocPathBySY(sy?: S_Node) {
  for (const [id, { block }] of Object.entries(allDocSY)) {
    if (id === sy?.ID) {
      return DB_block_path(block);
    }
  }
}
export async function getSyByDoc_block(doc: DB_block): Promise<S_Node> {
  const oldDoc = allDocSY[doc.id];
  if (oldDoc && oldDoc.block.hash === doc.hash) {
    return oldDoc.node;
  }
  /** 当没有缓存且 hash 变化时重新获取 sy */
  const path = DB_block_path(doc);
  const sy = (await API.file_getFile({
    path,
  })) as S_Node;
  allDocSY[doc.id] = { node: sy, block: doc, forwardReference: [] };
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

/** 管理文档的引用关系 */
const sy_refs = new Map<S_Node, /** S_Node所正向引用的文档id */ string[]>();
export function sy_refs_add(sy: S_Node, ref: string) {
  const refs = sy_refs.get(sy);
  if (refs === undefined) {
    sy_refs.set(sy, [ref]);
  } else if (refs.includes(ref) === true) {
    // refs 已经包含了，不管他
  } else {
    refs.push(ref);
  }
}
export function sy_refs_get(sy: S_Node) {
  return sy_refs.get(sy) ?? [];
}
