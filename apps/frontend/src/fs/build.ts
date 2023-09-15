import { htmlTemplate } from "./htmlTemplate";
import { API } from "./siyuan_api";
import { DB_block, notebook } from "./siyuan_type";
import JSZip from "jszip";

export interface docTree {
  [docPath: string]: { docHTML: string; title: string };
}
export async function* build(book: notebook) {
  const docTree = {} as docTree;
  const emit = {
    log(_s: string) {},
    percentage(_n: number) {},
    docTree,
  };
  yield emit;
  yield `=== 开始编译 ${book.name} ===`;
  /** 查询所有文档级block */
  const r: DB_block[] = await API.query_sql({
    stmt: `
    SELECT *
    from blocks
    WHERE box = '${book.id}'
        AND type = 'd'
  `,
  });
  console.log(r);

  for (const docBlock of r) {
    const doc = await API.export_exportHTML({
      id: docBlock.id,
      pdf: false,
      savePath: "",
    });
    docTree[docBlock.hpath + ".html"] = {
      docHTML: doc.content,
      title: docBlock.fcontent,
    };

    yield `处理： ${docBlock.name}: ${docBlock.id}`;
  }
  downloadZIP(docTree);
  yield "ok";
}
/** 下载zip */
export async function downloadZIP(docTree: docTree) {
  const zip = new JSZip();
  const presetZip = await (await fetch("/public.zip")).arrayBuffer();
  await zip.loadAsync(presetZip);
  for (const [path, { docHTML, title }] of Object.entries(docTree)) {
    zip.file(
      path,
      htmlTemplate({ title, htmlContent: docHTML, level: path.split("/").length - 2 /** 最开头有一个 / 所以减二 */ }),
    );
  }
  zip
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
