import { currentConfig } from "@/config";
import { htmlTemplate } from "./htmlTemplate";
import { getSyByPath } from "./node";
import { renderHTML } from "./render";
import { API } from "./siyuan_api";
import { DB_block, DB_block_path, S_Node, notebook } from "./siyuan_type";
import JSZip from "jszip";

export interface docTree {
  [docPath: string]: { sy: S_Node };
}

export async function* build(
  book: notebook,
  config = currentConfig.value,
  otherConfig?: {
    /** 实验性api https://github.com/WICG/file-system-access/blob/main/EXPLAINER.md */
    dir_ref: any;
  },
) {
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
    total += oldPercentage;
    return (/** 0~1 的小数 */ process: number) => {
      oldPercentage = process * percentage;
      emit.percentage((total + oldPercentage) * 100);
    };
  }
  yield emit;
  yield `=== 开始编译 ${book.name} ===`;
  let process = processPercentage(0.4);
  /** 查询所有文档级block */
  // TODO 需要更换成能够完全遍历一个笔记本的写法
  const r: DB_block[] = await API.query_sql({
    stmt: `
    SELECT *
    from blocks
    WHERE box = '${book.id}'
        AND type = 'd'
    limit 1500 OFFSET 0
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
  const docHTML = {} as { [htmlPath: string]: string | ArrayBuffer };

  process = processPercentage(0.4);
  const arr = Object.entries(docTree);
  for (let i = 0; i < arr.length; i++) {
    const [path, { sy }] = arr[i];
    try {
      docHTML[path + ".html"] = await htmlTemplate(
        {
          title: sy.Properties?.title || "",
          htmlContent: await renderHTML(sy),
          level: path.split("/").length - 2 /** 最开头有一个 /  还有一个 data 目录所以减二 */,
        },
        config.cdn,
      );
    } catch (error) {
      console.log(path, "渲染失败", error);
    }

    process(i / arr.length);
    yield `渲染： ${path}`;
  }
  yield `=== 渲染文档完成 ===`;
  yield `=== 开始复制资源文件文件 ===`;
  const assets: DB_block[] = await API.query_sql({
    stmt: `SELECT *
    from assets
    WHERE box = '${book.id}'
    limit 1500 OFFSET 0`,
  });
  for (let i = 0; i < assets.length; i++) {
    const item = assets[i];
    const r = (await API.file_getFile({
      path: `data/${book.id}/${item.path}`,
    })) as ArrayBuffer;
    docHTML[item.path] = r;
  }

  yield `=== 开始输出文件 ===`;
  if (otherConfig?.dir_ref) {
    await writeFileSystem(docHTML, otherConfig.dir_ref);
  }
  if (config.compressedZip) {
    await downloadZIP(docHTML, {
      withoutZip: config.withoutPublicZip,
      publicZip: config.cdn.publicZip,
    });
  }

  emit.percentage(100);
  yield "ok";
}
/** 下载zip */
export async function downloadZIP(
  docTree: { [htmlPath: string]: string | ArrayBuffer },
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

async function writeFileSystem(
  docTree: { [htmlPath: string]: string | ArrayBuffer },
  dir_ref: any,
) {
  /** 并发写文件 */
  await Promise.all(
    Object.entries(docTree).map(async ([path, html]) => {
      await writeFile(dir_ref, path, html);
    }),
  );
  // for (const [path, html] of Object.entries(docTree)) {
  //   await writeFile(dir_ref, path, html);
  //   console.log("写出", path);
  // }
  async function writeFile(dir_ref: any, name: string, data: string | ArrayBuffer) {
    const pathArr = name.split("/");
    /** 如果路径中的目录不存在则创建 */
    if (pathArr.length > 1) {
      for (let i = 0; i < pathArr.length - 1; i++) {
        const dirName = pathArr[i];
        if (dirName === "") {
          continue;
        }
        dir_ref = await dir_ref.getDirectoryHandle(dirName, { create: true });
      }
    }
    /** 写文件 */
    const new_file = await dir_ref.getFileHandle(pathArr[pathArr.length - 1], { create: true });
    const new_file_writer = await new_file.createWritable();
    await new_file_writer.write(data);
    await new_file_writer.close();
  }
}
