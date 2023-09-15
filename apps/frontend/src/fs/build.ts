import { htmlTemplate } from "./htmlTemplate";
import { API } from "./siyuan_api";
import { DB_block, DB_block_path, S_Node, notebook } from "./siyuan_type";
import JSZip from "jszip";

export interface docTree {
  [docPath: string]: { sy: S_Node };
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
  yield `=== 查询文档级block完成 ===`;

  for (const docBlock of r) {
    const path = DB_block_path(docBlock);
    const sy = await API.file_getFile({
      path,
    });
    docTree[docBlock.hpath] = { sy };

    yield `处理： ${docBlock.fcontent}: ${docBlock.id}`;
  }
  downloadZIP(docTree);
  yield "ok";
}
/** 下载zip */
export async function downloadZIP(docTree: docTree) {
  const zip = new JSZip();
  const presetZip = await (await fetch("/public.zip")).arrayBuffer();
  await zip.loadAsync(presetZip);
  for (const [path, { sy }] of Object.entries(docTree)) {
    zip.file(
      path + ".html",
      await htmlTemplate({
        title: sy.Properties?.title || "",
        htmlContent: await renderHTML(sy),
        level: path.split("/").length - 2 /** 最开头有一个 / 所以减二 */,
      }),
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

export async function renderHTML(sy: S_Node): Promise<string> {
  if (sy.Type in render) {
    //@ts-ignore
    return await render[sy.Type](sy);
  } else {
    console.log("没有找到对应的渲染器", sy.Type);
    return `=== 没有找到对应的渲染器 ${sy.Type} ===`;
  }
  return "";
}
const html = String.raw;
async function childRender(sy: S_Node) {
  let h = "";
  for await (const el of sy?.Children ?? []) {
    h += await renderHTML(el);
    h += "\n";
  }
  return h;
}
function strAttr(sy: S_Node) {
  const subtype_class = (() => {
    if (sy.Type === "NodeDocument") return "h1";
    else if (sy.Type === "NodeHeading") return `h${sy.HeadingLevel}`;
    else if (sy.Type === "NodeList") return ["u", `list`];
    else if (sy.Type === "NodeListItem") return ["u", `li`];
    else if (sy.Type === "NodeParagraph") return ["", `p`];
    else if (sy.Type === "NodeImage") return ["", `img`];
    else return "";
  })();
  let attr = "";
  function addAttr(s: string) {
    attr += s + " ";
  }
  if (sy.ID) addAttr(`id="${sy.ID}" data-node-id="${sy.ID}"`);
  addAttr(`data-type="${sy.Type}"`);
  if (sy.Properties?.updated) addAttr(`updated="${sy.Properties?.updated}"`);
  if (subtype_class !== "") {
    if (typeof subtype_class === "string") {
      addAttr(`data-subtype="${subtype_class}" class="${subtype_class}"`);
    } else {
      if (subtype_class[0] !== "") addAttr(`data-subtype="${subtype_class[0]}"`);
      if (subtype_class[1] !== "") addAttr(`class="${subtype_class[1]}"`);
    }
  }
  if (sy.ListData?.BulletChar)
    addAttr(`data-marker="${String.fromCharCode(sy.ListData.BulletChar)}"`);

  return attr;
}
const render = {
  NodeDocument: async (sy: S_Node) => html`<div
      ${strAttr(sy)}
      icon="1f4f0"
      title="${sy.Properties?.title}"
      type="doc"
    >
      <div style="height:25vh;${sy.Properties?.["title-img"]}"></div>
      <div>${sy.Properties?.title}</div>
    </div>
    ${await childRender(sy)}`,
  NodeHeading: async (sy: S_Node) =>
    html`<div ${strAttr(sy)}>
      <div>${await childRender(sy)}</div>
    </div>`,
  NodeText: async (sy: S_Node) => sy.Data,
  NodeList: async (sy: S_Node) => html`<div ${strAttr(sy)}>${await childRender(sy)}</div>`,
  NodeListItem: async (sy: S_Node) =>
    html`<div ${await strAttr(sy)}>
      <div class="protyle-action" draggable="true">
        <svg><use xlink:href="#iconDot"></use></svg>
      </div>
      ${await childRender(sy)}
    </div>`,
  NodeParagraph: async (sy: S_Node) => html`<div ${strAttr(sy)}>${await childRender(sy)}</div>`,
  NodeTextMark: async (sy: S_Node) => {
    if (sy.TextMarkType === "block-ref") {
      let href = ".";
      if (sy.TextMarkBlockRefID) {
        //TODO 处理层级问题和非doc链接问题
        href += (await API.filetree_getHPathByID({ id: sy.TextMarkBlockRefID })) + ".html";
      }

      return html`<span
        data-type="${sy.TextMarkType}"
        data-subtype="${/** "s" */ sy.TextMarkBlockRefSubtype}"
        data-id="${/** 被引用块的id */ sy.TextMarkBlockRefID}"
      >
        <a href="${href}">${sy.TextMarkTextContent}</a>
      </span>`;
    } else if (sy.TextMarkType === "a") {
      return html`<a href="${sy.TextMarkAHref}">${sy.TextMarkTextContent}</a>`;
    } else if (
      [
        "strong",
        "em",
        "u",
        "s",
        "mark",
        "sup",
        "sub",
        "kbd",
        "tag",
        "code",
        "strong",
        "code",
      ].includes(sy?.TextMarkType ?? "")
    ) {
      /** 颜色 //TODO 应该设计一个统一的 Properties 附加 */
      return html`<span style="${sy.Properties?.style}" data-type="${sy.TextMarkType}"
        >${sy.TextMarkTextContent}</span
      >`;
    } else if (sy.TextMarkType === "inline-math") {
      return html`<span
        data-type="inline-math"
        data-subtype="math"
        data-content="${sy.TextMarkInlineMathContent}"
        class="render-node"
      ></span>`;
    } else if (sy.TextMarkType === "inline-memo" /** 备注 */) {
      return html`${sy.TextMarkTextContent}<sup>（${sy.TextMarkInlineMemoContent}）</sup>`;
    } else {
      console.log("没有找到对应的渲染器 NodeTextMark.TextMarkType", sy.TextMarkType);
      return "";
    }
  },
  NodeImage: async (sy: S_Node) => {
    let link = "";
    const LinkDest = sy.Children?.filter((c) => c.Type === "NodeLinkDest");
    if (LinkDest?.length === 1) {
      link = await renderHTML(LinkDest[0]);
    } else if (LinkDest?.length && LinkDest.length > 1) {
      console.log("NodeImage 存在多个 LinkDest", sy);
    }

    let title = "";
    const LinkTitle = sy.Children?.filter((c) => c.Type === "NodeLinkTitle");
    if (LinkTitle?.length === 1) {
      title = await renderHTML(LinkTitle[0]);
    } else if (LinkTitle?.length && LinkTitle.length > 1) {
      console.log("NodeImage 存在多个 LinkTitle", sy);
    }
    return html`<span ${await strAttr(sy)} style="${sy.Properties?.["parent-style"]}"
      ><img
        src="${link}"
        data-src="${link}"
        title="${title}"
        style="${sy.Properties?.style}"
      /><span class="protyle-action__title">${title}</span></span
    >`;
  },
  NodeLinkDest: async (sy: S_Node) => sy.Data,
  NodeLinkTitle: async (sy: S_Node) => sy.Data,
  NodeKramdownSpanIAL: async (_sy: S_Node) => "",
};
