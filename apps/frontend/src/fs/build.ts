import { currentConfig } from "@/config";
import { htmlTemplate } from "./htmlTemplate";
import { getSyByDoc_block, sy_refs_get } from "./node";
import { renderHTML } from "./render";
import { API } from "./siyuan_api";
import { DB_block, DB_block_path, S_Node } from "./siyuan_type";
import JSZip from "jszip";
import { deepAssign } from "@/util/deep_assign";

export interface DocTree {
  [/** "/计算机基础课/自述" */ docPath: string]: { sy: S_Node; docBlock: DB_block };
}
interface FileTree {
  [path: string]: string | ArrayBuffer;
}

export async function* build(
  config = currentConfig.value,
  otherConfig?: {
    /** 实验性api https://github.com/WICG/file-system-access/blob/main/EXPLAINER.md */
    dir_ref: any;
  },
) {
  const book = config.notebook;
  const docTree: DocTree = {};
  const skipBuilds = useSkipBuilds();
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
  /** 查询所有文档级block
   * 这里必须要每次重新查询，不然用户重新编译无法获得新修改的结果
   */
  // TODO 需要更换成能够完全遍历一个笔记本的写法
  const Doc_blocks: DB_block[] = await API.query_sql({
    stmt: `
    SELECT *
    from blocks
    WHERE box = '${book.id}'
        AND type = 'd'
    limit 150000 OFFSET 0
  `,
  });
  function refsNotUpdated(docBlock: DB_block): boolean {
    const refs = config.__skipBuilds__[docBlock.id]?.refs ?? [];
    for (const ref_id of refs) {
      const new_doc_hash = Doc_blocks.find((docBlock) => docBlock.id === ref_id)?.hash;
      const old_doc_hash = config.__skipBuilds__[ref_id]?.hash;
      if (new_doc_hash === undefined || old_doc_hash === undefined) {
        /** 不应该进入此分支的，如果进来了就重新编译吧 */
        return false;
      } else if (new_doc_hash === old_doc_hash) {
        continue;
      } else {
        return false;
      }
    }
    /** 引用的都没有更新 */
    return true;
  }
  yield `=== 查询文档级block完成 ===`;
  for (let i = 0; i < Doc_blocks.length; i++) {
    const docBlock = Doc_blocks[i];
    const sy = await getSyByDoc_block(docBlock);
    docTree[docBlock.hpath] = { sy, docBlock };
    process(i / Doc_blocks.length);
  }
  const fileTree: FileTree = {};

  process = processPercentage(0.4);
  const arr = Object.entries(docTree);
  for (let i = 0; i < arr.length; i++) {
    const [path, { sy, docBlock }] = arr[i];
    if (
      config.enableIncrementalCompilation &&
      config.enableIncrementalCompilation_doc &&
      /** 文档本身没有发生变化 */
      config.__skipBuilds__[docBlock.id]?.hash === docBlock.hash &&
      /** docBlock所引用的文档也没有更新 */
      refsNotUpdated(docBlock)
    ) {
      continue; /** skip */
    } else {
      try {
        fileTree[path + ".html"] = await htmlTemplate(
          {
            title: sy.Properties?.title || "",
            htmlContent: await renderHTML(sy),
            level: path.split("/").length - 2 /** 最开头有一个 /  还有一个 data 目录所以减二 */,
          },
          {
            ...config.cdn,
            embedCode: config.embedCode,
          },
        );
        if (config.enableIncrementalCompilation && config.enableIncrementalCompilation_doc) {
          skipBuilds.add(docBlock.id, {
            hash: docBlock.hash,
          });
        }
        /** 无论是否配置增量更新都要更新引用，不然开启增量更新后没有引用数据可用 */
        skipBuilds.add(docBlock.id, {
          refs: /** 保存引用 */ sy_refs_get(sy),
        });
      } catch (error) {
        yield `${path} 渲染失败:${error}`;
        console.log(path, "渲染失败", error);
      }
    }
    process(i / arr.length);
    yield `渲染： ${path}`;
  }
  yield `=== 渲染文档完成 ===`;
  if (config.sitemap.enable) {
    yield `=== 开始生成 sitemap.xml ===`;
    fileTree["sitemap.xml"] = sitemap_xml(Doc_blocks, config.sitemap);
  }
  if (config.excludeAssetsCopy === false) {
    yield `=== 开始复制资源文件 ===`;
    const assets: { box: string; docpath: string; path: string; hash: string; id: string }[] =
      await API.query_sql({
        stmt: `SELECT *
                from assets
                WHERE box = '${book.id}'
                limit 150000 OFFSET 0`,
      });
    await Promise.allSettled(
      assets.map(async (item) => {
        if (
          config.enableIncrementalCompilation &&
          /** 资源没有变化，直接跳过 */
          config.__skipBuilds__[item.id]?.hash === item.hash
        ) {
          return /** skip */;
        } else {
          fileTree[item.path] = await API.get_assets({
            path: item.path,
          });
          if (config.enableIncrementalCompilation) {
            skipBuilds.add(item.id, { hash: item.hash });
          }
        }
      }),
    );
  }

  // === 输出编译成果 ===
  if (otherConfig?.dir_ref) {
    yield `=== 开始写文件到磁盘 ===`;
    await writeFileSystem(fileTree, otherConfig.dir_ref);
  }
  if (config.compressedZip) {
    yield `=== 开始生成压缩包 ===`;
    await downloadZIP(fileTree, {
      withoutZip: config.withoutPublicZip,
      publicZip: config.cdn.publicZip,
    });
  }
  /** 更新跳过编译的资源 */
  skipBuilds.write();
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
      link.download = `notebook.zip`;
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
      await writeFile(dir_ref, path, html).catch((e) => {
        console.log(e, dir_ref);
      });
    }),
  );
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

function sitemap_xml(
  docArr: DB_block[],
  config: {
    sitePrefix: string;
  },
) {
  const urlList: string = docArr
    .map((doc) => {
      let lastmod = "";
      const time = doc.ial.match(/updated=\"(\d+)\"/)?.[1] ?? doc.created;
      if (time) {
        lastmod = `\n<lastmod>${time.slice(0, 4)}-${time.slice(4, 6)}-${time.slice(
          6,
          8,
        )}</lastmod>`;
      }
      return `<url>
<loc>${config.sitePrefix}${doc.hpath}.html</loc>${lastmod}
</url>\n`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlList}
</urlset>`;
}

function useSkipBuilds() {
  const obj: { [k: string]: { hash?: string } } = {};
  return {
    add(id: string, value: { hash?: string; refs?: string[] }) {
      if (obj[id] === undefined) {
        obj[id] = {};
      }
      deepAssign(obj[id], value);
    },
    /** 将缓存的写入到配置文件 */
    write() {
      deepAssign(currentConfig.value.__skipBuilds__, obj);
    },
  };
}
