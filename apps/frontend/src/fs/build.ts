import { API } from "./siyuan_api";
import { notebook } from "./siyuan_type";
import JSZip from "jszip";

export interface docTree {
  [docPath: string]: { docHTML: string };
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
  const r = await API.filetree_listDocsByPath({ notebook: book.id, path: "/" });
  for (const file of r.files) {
    const doc = await API.filetree_getDoc({
      id: file.id,
      isBacklink: false,
      mode: 0,
      size: 48,
    });
    docTree[(await API.filetree_getHPathByID({ id: file.id })) + ".html"] = {
      docHTML: doc.content,
    };

    yield `处理： ${file.name} ${file.id}`;
  }
  yield "ok";
}
/** 下载zip */
export async function downloadZIP() {
  const zip = new JSZip();
  const presetZip = await (await fetch("/常见问题.zip")).arrayBuffer();
  zip.loadAsync(presetZip);
  // zip.file(
  //   (await API.filetree_getHPathByID({ id: file.id })) + ".html",
  //   htmlTemplate({ title: file.name, html: doc.content })
  // );

  // emit.zip
  // .generateAsync({ type: "blob" })
  // .then((content) => {
  //   // 将ZIP文件保存为下载
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(content);
  //   link.download = "example.zip";
  //   link.click();
  // })
  // .catch((error) => {
  //   console.error(error);
  // });
}
