import { getNodeByID, getDocPathBySY } from "./node";
import { API } from "./siyuan_api";
import { DB_block, S_Node, NodeType } from "./siyuan_type";

export async function renderHTML(
  sy: S_Node | undefined,
  /**
   * renderHTML 内部会创建一个 renderInstance 的浅克隆
   * 用来维护 renderHTML.nodeStack 的正常运转
   */
  renderInstance: typeof render = render,
): Promise<string> {
  if (sy === undefined) return "";
  const renderObj = {
    ...renderInstance,
    /** 避免让所有的 renderInstance.nodeStack 是同一个对象 ，所以这里创建一个新 []  */
    nodeStack: [...renderInstance.nodeStack],
  };
  if (renderInstance.nodeStack.includes(sy)) {
    console.log("=== 存在循环引用 ===", renderInstance.nodeStack);
    return `<div class="ft__smaller ft__secondary b3-form__space--small">存在循环引用</div>`;
  }
  if (sy.Type in render) {
    if (renderObj[sy.Type] === undefined) {
      return `=== 没有找到对应的渲染器 ${sy.Type}  ${renderObj.nodeStack[0].Properties?.title}===`;
    } else {
      renderObj.nodeStack.push(sy);
      const r = await renderObj[sy.Type]!(sy);
      renderObj.nodeStack.pop();
      return r;
    }
  } else {
    console.log("没有找到对应的渲染器", sy.Type, renderObj.nodeStack[0].Properties?.title);
    return `=== 没有找到对应的渲染器 ${sy.Type} ===`;
  }
}
function isRenderCode(sy: S_Node) {
  const mark = atob(
    sy.CodeBlockInfo ??
      sy.Children?.find((el) => el.Type === "NodeCodeBlockFenceInfoMarker")?.CodeBlockInfo ??
      "",
  );
  return [
    ["mindmap", "mermaid", "echarts", "abc", "graphviz", "flowchart", "plantuml"].includes(mark),
    mark,
  ] as const;
}
const html = String.raw;
async function childRender(sy: S_Node, renderInstance: typeof render) {
  let h = "";
  for await (const el of sy?.Children ?? []) {
    h += await renderHTML(el, renderInstance);
    h += "\n";
  }
  return h;
}
function strAttr(sy: S_Node) {
  const subtype_class = (() => {
    const typ_subtype =
      sy.ListData?.Typ === 1
        ? /** 有序列表 */ "o"
        : sy.ListData?.Typ === 3
        ? /** 任务列表 */ "t"
        : /** 无序列表 */ "u";

    if (sy.Type === "NodeDocument") return "h1";
    else if (sy.Type === "NodeHeading") return `h${sy.HeadingLevel}`;
    else if (sy.Type === "NodeList") return [typ_subtype, "list"];
    else if (sy.Type === "NodeListItem") return [typ_subtype, "li"];
    else if (sy.Type === "NodeParagraph") return ["", "p"];
    else if (sy.Type === "NodeImage") return ["", "img"];
    else if (sy.Type === "NodeBlockquote") return ["", "bq"];
    else if (sy.Type === "NodeSuperBlock") return ["", "sb"];
    else if (sy.Type === "NodeCodeBlock") {
      const [yes, mark] = isRenderCode(sy);
      if (yes) {
        /** 脑图等需要渲染的块 */
        return [mark, "render-node"];
      } else {
        return ["", "code-block"];
      }
    } else if (sy.Type === "NodeTable") return ["", "table"];
    else if (sy.Type === "NodeThematicBreak") return ["", "hr"];
    else if (sy.Type === "NodeMathBlock") return ["math", "render-node"];
    else if (sy.Type === "NodeIFrame") return ["", "iframe"];
    else if (sy.Type === "NodeVideo") return ["", "iframe"];
    else return "";
  })();
  const attrObj = {} as { [k: string]: string };

  function addAttr(key: string, value: string) {
    attrObj[key] = value;
  }
  if (sy.ID) {
    addAttr("id", sy.ID);
    addAttr("data-node-id", sy.ID);
  }

  if (sy?.TextMarkType === "tag") {
    addAttr(`data-type`, sy.TextMarkType ?? "");
  } else {
    addAttr(`data-type`, sy.Type);
  }
  if (sy.Properties?.updated) addAttr("updated", sy.Properties.updated);
  if (subtype_class !== "") {
    if (typeof subtype_class === "string") {
      addAttr("data-subtype", subtype_class);
      addAttr("class", subtype_class);
    } else {
      if (subtype_class[0] !== "") addAttr("data-subtype", subtype_class[0]);
      if (subtype_class[1] !== "") addAttr("class", subtype_class[1]);
    }
  }
  if (sy.Properties) {
    Object.entries(sy.Properties).forEach(([k, v]) => addAttr(k, v));
  }
  if (sy.ListData?.Marker) addAttr("data-marker", atob(sy.ListData.Marker));
  if (
    /** 任务列表 */ sy.ListData?.Typ === 3 &&
    /** 该项被选中 */ sy.Children?.find((el) => el.Type === "NodeTaskListItemMarker")
      ?.TaskListItemChecked
  ) {
    attrObj["class"] = (attrObj["class"] ?? "") + " protyle-task--done ";
  }
  /** 不折叠任何项目 */ delete attrObj["fold"];
  return Object.entries(attrObj)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
}
/** 返回空字符串，一般用于不用解析的节点 */
const _emptyString = async (_sy: S_Node) => "";
const _dataString = async (sy: S_Node) => sy.Data ?? "";

const render: { [key in keyof typeof NodeType]?: (sy: S_Node) => Promise<string> } & {
  /** 用于保存调用栈，
   * 例如在渲染文档A( 文档A中引用了文档B中的节点) 时调用栈如下
   * ```
   *    nodeStack ~= [A_NodeDocument,A_NodeList,...,A_block-ref,B_Node]
   * ```
   * 对render中的函数意味着 `this.nodeStack[0]===需要生成的文档`
   * 这样就方便解决 block-ref 等链接问题
   * */
  nodeStack: S_Node[];
  getTopPathPrefix: () => Promise<string>;
} = {
  nodeStack: [] as S_Node[],
  async getTopPathPrefix() {
    const sy = this.nodeStack[0];
    let prefix = ".";
    if (sy.Type === "NodeDocument" && sy.ID) {
      /** 基于当前文档路径将 href ../ 到顶层 */
      const path = getDocPathBySY(sy);
      if (path) {
        /** path data/box_id/doc_id/doc_id/doc_id.sy `data/box_id/` 这一节是多出来的，所以要减3 */
        const level = path.split("/").length - 3;
        for (let i = 0; i < level; i++) {
          prefix += "/..";
        }
      }
      return prefix;
    } else {
      console.log("未定义顶层元素非 NodeDocument 时的处理方式", sy);
      return "";
    }
  },
  async NodeDocument(sy) {
    return html`<div ${strAttr(sy)} icon="1f4f0" type="doc">
        <div style="height:25vh;${sy.Properties?.["title-img"]}"></div>
        <div>${sy.Properties?.title}</div>
      </div>
      ${await childRender(sy, this)}`;
  },
  async NodeHeading(sy) {
    return html`<div ${strAttr(sy)}>
      <div>${await childRender(sy, this)}</div>
    </div>`;
  },
  NodeText: _dataString,
  async NodeList(sy) {
    return html`<div ${strAttr(sy)}>${await childRender(sy, this)}</div>`;
  },
  async NodeListItem(sy) {
    return html`<div ${await strAttr(sy)}>
      <div class="protyle-action">
        ${sy.ListData?.Typ === 1
          ? /** 有序列表 */ atob(sy.ListData?.Marker ?? "")
          : sy.ListData?.Typ === 3
          ? /** 任务列表 */ `<svg><use xlink:href="#${
              sy.Children?.find((el) => el.Type === "NodeTaskListItemMarker")?.TaskListItemChecked
                ? "iconCheck"
                : "iconUncheck"
            }"></use></svg>`
          : /** 无序列表 */ `<svg><use xlink:href="#iconDot"></use></svg>`}
      </div>
      ${await childRender(sy, this)}
    </div>`;
  },
  NodeTaskListItemMarker: _emptyString,

  async NodeParagraph(sy) {
    return html`<div ${strAttr(sy)}>${await childRender(sy, this)}</div>`;
  },
  async NodeTextMark(sy) {
    if (sy.TextMarkType === "block-ref") {
      let href = ".";
      if (sy.TextMarkBlockRefID) {
        if (this.nodeStack[0].Type === "NodeDocument" && this.nodeStack[0].ID) {
          /** 基于当前文档路径将 href ../ 到顶层 */
          const level =
            (await API.filetree_getHPathByID({ id: this.nodeStack[0].ID })).split("/").length - 2;

          for (let i = 0; i < level; i++) {
            href += "/..";
          }
          href += (await API.filetree_getHPathByID({ id: sy.TextMarkBlockRefID })) + ".html";
        } else {
          console.log("未定义顶层元素非 NodeDocument 时的处理方式", sy);
        }
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
      /** 颜色 */
      return html`<span ${strAttr(sy)} data-type="${sy.TextMarkType}"
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
  async NodeImage(sy) {
    let link = "";
    const LinkDest = sy.Children?.filter((c) => c.Type === "NodeLinkDest");
    if (LinkDest?.length === 1) {
      link = await renderHTML(LinkDest[0], this);
    } else if (LinkDest?.length && LinkDest.length > 1) {
      console.log("NodeImage 存在多个 LinkDest", sy);
    }

    let title = "";
    const LinkTitle = sy.Children?.filter((c) => c.Type === "NodeLinkTitle");
    if (LinkTitle?.length === 1) {
      title = await renderHTML(LinkTitle[0], this);
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
  async NodeLinkDest(sy) {
    return `${await this.getTopPathPrefix()}/${sy.Data}`;
  },
  NodeLinkTitle: _dataString,
  NodeKramdownSpanIAL: _emptyString,
  async NodeSuperBlock(sy) {
    return html`<div
      ${strAttr(sy)}
      data-sb-layout="${childDateByType(sy, "NodeSuperBlockLayoutMarker")}"
    >
      ${await childRender(sy, this)}
    </div>`;
  },
  NodeSuperBlockOpenMarker: _emptyString,
  NodeSuperBlockCloseMarker: _emptyString,
  NodeSuperBlockLayoutMarker: _emptyString,
  async NodeBlockQueryEmbed(sy) {
    return html`<div ${strAttr(sy)} data-type="NodeBlockquote" class="bq">
      ${await childRender(sy, this)}
    </div>`;
  },
  NodeOpenBrace: _emptyString,
  NodeCloseBrace: _emptyString,
  async NodeBlockQueryEmbedScript(sy) {
    const sql = sy.Data;
    if (!sql) {
      console.log("no sql", sy);
      return html`<pre>${sql}</pre>`;
    }
    let htmlStr = "";
    const blocks: DB_block[] = await API.query_sql({ stmt: sql });
    for (const block of blocks) {
      const node = await getNodeByID(block.id);
      if (node === undefined) {
        // 一般来说是跨笔记引用
        // TODO 待处理跨笔记引用问题
        console.log("跨笔记引用", block.id, sql, node);
        return "";
      }
      htmlStr += await renderHTML(node, this);
    }

    return htmlStr;
  },
  async NodeBlockquote(sy) {
    return html`<div ${strAttr(sy)}>${await childRender(sy, this)}</div>`;
  },
  NodeBlockquoteMarker: _emptyString,
  NodeCodeBlock: async (sy) => {
    const [yes, _] = isRenderCode(sy);
    if (yes) {
      return `<div ${strAttr(sy)} data-content="${(
        sy.Children?.find((el) => el.Type === "NodeCodeBlockCode")?.Data ?? ""
      )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")}">
        <div spin="1"></div>
        <div class="protyle-attr" contenteditable="false"></div>
      </div>`;
    }
    //TODO 语法高亮没有正确触发
    return `<div ${strAttr(sy)}>
        <div class="protyle-action">
          <span class="protyle-action--first protyle-action__language">
          ${await renderHTML(sy.Children?.find((el) => el.Type === "NodeCodeBlockFenceInfoMarker"))}
          </span>
            <span class="fn__flex-1"></span>
            <span class="protyle-icon protyle-icon--only protyle-action__copy">
            <svg><use xlink:href="#iconCopy"></use></svg>
          </span>
        </div>
        ${await renderHTML(sy.Children?.find((el) => el.Type === "NodeCodeBlockCode"))}
      </div>`;
  },
  NodeCodeBlockFenceInfoMarker: async (sy) => atob(sy.CodeBlockInfo ?? ""),
  NodeCodeBlockCode: async (sy) => `<div class="hljs" spellcheck="false">${sy.Data}</div>`,
  NodeCodeBlockFenceOpenMarker: _emptyString,
  NodeCodeBlockFenceCloseMarker: _emptyString,
  async NodeTable(sy) {
    return `<div ${strAttr(sy)}>
    <div>
      <table spellcheck="false">
        <colgroup>
        ${sy.TableAligns?.map(() => "<col />").join("")}
        </colgroup>
        ${await renderHTML(sy.Children?.find((el) => el.Type === "NodeTableHead"))}
        <tbody>
        ${(
          await Promise.all(
            sy.Children?.filter((el) => el.Type === "NodeTableRow").map((el) =>
              renderHTML(el, this),
            ) ?? [],
          )
        ).join("\n")}
        </tbody>
      </table>
    </div>
  </div>`;
  },
  async NodeTableHead(sy) {
    return `<${sy.Data}>${await childRender(sy, this)}</${sy.Data}>`;
  },
  async NodeTableRow(sy) {
    return `<tr>${await childRender(sy, this)}</tr>`;
  },
  async NodeTableCell(sy) {
    return `<td>${await childRender(sy, this)}</td>`;
  },
  NodeHTMLBlock: async (sy) => `<div ${strAttr(sy)}>${sy.Data}</div>`,
  NodeThematicBreak: async (sy) => `<div ${strAttr(sy)}><div></div></div>`,
  NodeMathBlock: async (sy) => `<div ${strAttr(sy)} data-content="${childDateByType(
    sy,
    "NodeMathBlockContent",
  )}">
    <div spin="1"></div>
  </div>`,
  NodeMathBlockOpenMarker: _emptyString,
  NodeMathBlockCloseMarker: _emptyString,
  NodeIFrame: async (sy) => ` <div ${strAttr(sy)}>
    <div class="iframe-content">
    ${sy.Data}
    </div>
  </div>`,
  //TODO 音视频的链接需要重写
  NodeVideo: async (sy) => `<div  ${strAttr(sy)}>
    <div class="iframe-content">
      ${sy.Data}
    </div>
  </div>`,
  NodeAudio: async (sy) => `<div  ${strAttr(sy)}>
    <div class="iframe-content">
      ${sy.Data}
    </div>
  </div>`,
  /** 虚拟链接 */
  NodeHeadingC8hMarker: _emptyString,
  async NodeSoftBreak(_sy) {
    //TODO 此处实现应该有问题
    /** https://zh.wikipedia.org/wiki/零宽空格 */
    return "\u200B";
  },
  async NodeBr(sy) {
    return `<${sy.Data}>`;
  },
};

/** 获取sy节点的child中第一个type类型节点的data */
function childDateByType(sy: S_Node, type: S_Node["Type"]) {
  return sy.Children?.find((el) => el.Type === type)?.Data;
}
