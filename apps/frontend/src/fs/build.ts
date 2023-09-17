import { htmlTemplate } from "./htmlTemplate";
import { getSyByPath } from "./node";
import { renderHTML } from "./render";
import { API } from "./siyuan_api";
import { DB_block, DB_block_path, S_Node, notebook } from "./siyuan_type";
import JSZip from "jszip";

export interface docTree {
  [docPath: string]: { sy: S_Node };
}
const defaultConfig = {
  cdn: {
    /** 思源 js、css等文件的前缀 */
    siyuanPrefix:
      "https://cdn.jsdelivr.net/gh/2234839/oceanPress_js/main/apps/frontend/public/notebook/",
    /** 思源 js、css等文件zip包地址 https://cdn.jsdelivr.net/gh/2234839/oceanPress_js@raw/main/apps/frontend/public/public.zip */
    publicZip:
      "https://fastly.jsdelivr.net/gh/2234839/oceanPress_js@main/apps/frontend/public/public.zip",
  },
};
export async function* build(book: notebook, config = defaultConfig) {
  const docTree = {} as docTree;
  const emit = {
    log(_s: string) {},
    percentage(_n: number) {},
    docTree,
  };
  let oldPercentage = 0;
  let total = 0;
  /** 较为精准的估计进度 */
  function processPercentage(/**  0~1 的小数 表示这个数占整体百分之多少 */ percentage: number) {
    total += percentage * oldPercentage;
    return (/** 0~1 的小数 */ process: number) => {
      oldPercentage = process * percentage;
      emit.percentage((total + oldPercentage) * 100);
    };
  }
  yield emit;
  yield `=== 开始编译 ${book.name} ===`;
  let process = processPercentage(0.4);
  /** 查询所有文档级block */
  const r: DB_block[] = await API.query_sql({
    stmt: `
    SELECT *
    from blocks
    WHERE box = '${book.id}'
        AND type = 'd'
  `,
  });
  yield `=== 查询文档级block完成 ===`;
  for (let i = 0; i < r.length; i++) {
    const docBlock = r[i];
    const path = DB_block_path(docBlock);
    const sy = await getSyByPath(path);
    docTree[docBlock.hpath] = { sy };
    process(i / r.length);
    yield `读取： ${docBlock.fcontent}: ${docBlock.id}`;
  }
  const docHTML = {} as { [htmlPath: string]: string };

  process = processPercentage(0.4);
  const arr = Object.entries(docTree);
  for (let i = 0; i < arr.length; i++) {
    const [path, { sy }] = arr[i];
    docHTML[path + ".html"] = await htmlTemplate({
      title: sy.Properties?.title || "",
      htmlContent: await renderHTML(sy),
      level: path.split("/").length - 2 /** 最开头有一个 / 所以减二 */,
    });
    process(i / arr.length);
    yield `渲染： ${path}`;
  }
  yield `=== 渲染文档完成 ===`;
  yield `=== 开始打包 zip ===`;
  await downloadZIP(docHTML, {
    withoutZip: true,
    publicZip: config.cdn.publicZip,
  });

  emit.percentage(100);
  yield "ok";
}
/** 下载zip */
export async function downloadZIP(
  docTree: { [htmlPath: string]: string },
  config?: { publicZip?: string; withoutZip?: boolean },
) {
  const zip = new JSZip();
  if (config?.withoutZip !== true) {
    const presetZip = await (await fetch(config?.publicZip ?? "/public.zip")).arrayBuffer();
    await zip.loadAsync(presetZip);
  }
  for (const [path, html] of Object.entries(docTree)) {
    zip.file(path, html);
  }
  await zip
    .generateAsync({ type: "blob" })
    .then((content) => {
      // 将ZIP文件保存为下载
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "notebook.zip";
      link.click();
    })
    .catch((error) => {
      console.error(error);
    });
}
