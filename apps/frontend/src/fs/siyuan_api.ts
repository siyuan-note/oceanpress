import { Ref } from "vue";
import { PromiseObj, usePromiseComputed } from "../components/data_promise";
import { NodeDocument, file, notebook } from "./siyuan_type";
let Authorization = "";
export function setAuthorizedToken(s: string) {
  Authorization = s;
}
export interface api {
  /**
   *  列出笔记本
   */
  notebook_lsNotebooks(): {
    notebooks: notebook[];
  };
  block_getBlockInfo(p: { id: string }): {
    box: "20210816161940-zo21go1";
    path: "/20201104153359-sk9a3yg.sy";
    rootChildID: "20201104153359-sk9a3yg";
    rootID: "20201104153359-sk9a3yg";
    rootIcon: "";
    rootTitle: "markdown";
  };
  filetree_listDocsByPath(p: { notebook: notebook["id"]; path: "/" }): {
    box: "20210816161940-zo21go1";
    files: file[];
    path: "/";
  };
  filetree_getHPathByID(p: { id: file["id"] }): "/foo/bar";
  filetree_getDoc(p: { id: file["id"]; isBacklink: false; mode: 0; size: 48 }): NodeDocument;
  export_exportHTML(p: {
    id: file["id"];
    pdf: false;
    /** 为空时思源不会写文件 https://github.com/siyuan-note/siyuan/blob/master/kernel/model/export.go ：ExportHTML */
    savePath: "";
  }): {
    content: "<html>";
    id: "20200825162036-4dx365o";
    name: "排版元素";
  };
  query_sql(p: { /** SELECT * FROM blocks WHERE content LIKE'%content%' LIMIT 7 */ stmt: string }): any[];
}
type apiPromisify = {
  readonly [K in keyof api]: (...arg: Parameters<api[K]>) => Promise<unPromise<ReturnType<api[K]>>>;
};

/** 解开 promise 类型包装 */
declare type unPromise<T> = T extends Promise<infer R> ? R : T;

async function rpc(method: string, arg: any) {
  const res = await fetch(`http://127.0.0.1:6806/api/${method.replace(/_/g, "/")}`, {
    headers: {
      Authorization: `Token ${Authorization}`,
    },
    body: JSON.stringify(arg[0]),
    method: "POST",
  });
  const json = await res.json();
  if (json.code !== 0) {
    throw new Error(json.msg);
  }
  return json.data;
}

/** 包装了一次的 RC 方便跳转到函数定义  */
export const API = new Proxy(
  {},
  {
    get(_, method: string) {
      return (...arg: any) => rpc(method, arg);
    },
  },
) as apiPromisify;

type vApi = {
  readonly [K in keyof api]: (...arg: Parameters<api[K]>) => Ref<PromiseObj<unPromise<ReturnType<api[K]>>, Error>>;
};
/** 使用 usePromiseComputed 包装的方法，便于使用  */
export const vApi = new Proxy(
  {},
  {
    get(_, method: string) {
      return (...arg: any) => usePromiseComputed.fn(() => rpc(method, arg));
    },
  },
) as vApi;
