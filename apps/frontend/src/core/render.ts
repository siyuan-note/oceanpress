import { escaping, unescaping } from '@/util/escaping'
import { API } from './siyuan_api'
import { DB_block, S_Node, NodeType } from './siyuan_type'
import { storeDep } from '@/dependency'

export async function renderHTML(
  sy: S_Node | undefined,
  /**
   * renderHTML 内部会创建一个 renderInstance 的浅克隆
   * 用来维护 renderHTML.nodeStack 的正常运转
   */
  renderInstance: typeof render = render,
): Promise<string> {
  if (sy === undefined) return ''
  const renderObj = {
    ...renderInstance,
    /** 避免让所有的 renderInstance.nodeStack 是同一个对象 ，所以这里创建一个新 []  */
    nodeStack: [...renderInstance.nodeStack],
  }
  if (
    renderInstance.nodeStack.find(
      (node) => node.ID && sy.ID && node.ID === sy.ID,
    )
  ) {
    return warnDiv(
      '循环引用',
      [...renderInstance.nodeStack, sy].map((el) => el.ID),
    )
  }
  if (renderObj[sy.Type] === undefined) {
    return warnDiv(
      `没有找到对应的渲染器 ${sy.Type}  ${renderObj.nodeStack[0].Properties?.title}`,
    )
  } else {
    /** 入栈 */
    renderObj.nodeStack.push(sy)
    if (sy.ID && renderInstance.nodeStack[0]?.ID) {
      /** 维护引用关系 */
      const targetDoc = await storeDep.getDocByChildID(sy.ID)
      const currentDoc = renderInstance.nodeStack[0]
      if (targetDoc?.ID !== undefined && targetDoc.ID !== currentDoc.ID) {
        /** 代表这个节点不在当前文档中，却在编译currentDoc时出现了，所以 currentDoc依赖（正向引用）targetDoc  */
        // 记录引用
        // sy_refs_add(currentDoc, targetDoc.ID)
      }
    }
    const r = await renderObj[sy.Type]!(sy)
    /** 出栈 */
    renderObj.nodeStack.pop()
    return r
  }
}
function warnDiv(msg: string, ...args: any[]) {
  warn(msg, ...args)
  return `<div class="ft__smaller ft__secondary b3-form__space--small">${msg}</div>`
}
function isRenderCode(sy: S_Node) {
  const mark = atob(
    sy.CodeBlockInfo ??
      sy.Children?.find((el) => el.Type === 'NodeCodeBlockFenceInfoMarker')
        ?.CodeBlockInfo ??
      '',
  )
  return [
    [
      'mindmap',
      'mermaid',
      'echarts',
      'abc',
      'graphviz',
      'flowchart',
      'plantuml',
    ].includes(mark),
    mark,
  ] as const
}
const html = String.raw
async function childRender(sy: S_Node, renderInstance: typeof render) {
  let h = ''
  for await (const el of sy?.Children ?? []) {
    h += await renderHTML(el, renderInstance)
    h += '\n'
  }
  return h
}
function strAttr(
  sy: S_Node,
  config: {
    subtype_class?: string | [string, string]
    data_type?: string
  } = {},
) {
  if (config?.subtype_class === undefined) {
    config.subtype_class = (() => {
      const typ_subtype =
        sy.ListData?.Typ === 1
          ? /** 有序列表 */ 'o'
          : sy.ListData?.Typ === 3
          ? /** 任务列表 */ 't'
          : /** 无序列表 */ 'u'

      if (sy.Type === 'NodeDocument') return 'h1'
      else if (sy.Type === 'NodeHeading') return `h${sy.HeadingLevel}`
      else if (sy.Type === 'NodeList') return [typ_subtype, 'list']
      else if (sy.Type === 'NodeListItem') return [typ_subtype, 'li']
      else if (sy.Type === 'NodeParagraph') return ['', 'p']
      else if (sy.Type === 'NodeImage') return ['', 'img']
      else if (sy.Type === 'NodeBlockquote') return ['', 'bq']
      else if (sy.Type === 'NodeSuperBlock') return ['', 'sb']
      else if (sy.Type === 'NodeCodeBlock') {
        const [yes, mark] = isRenderCode(sy)
        if (yes) {
          /** 脑图等需要渲染的块 */
          return [mark, 'render-node']
        } else {
          return ['', 'code-block']
        }
      } else if (sy.Type === 'NodeTable') return ['', 'table']
      else if (sy.Type === 'NodeThematicBreak') return ['', 'hr']
      else if (sy.Type === 'NodeMathBlock') return ['math', 'render-node']
      else if (sy.Type === 'NodeIFrame') return ['', 'iframe']
      else if (sy.Type === 'NodeVideo') return ['', 'iframe']
      else return ''
    })()
  }
  const attrObj = {} as { [k: string]: string }
  function addAttr(key: string, value: string) {
    attrObj[key] = value
  }
  if (sy.ID) {
    addAttr('id', sy.ID)
    addAttr('data-node-id', sy.ID)
  }

  if (sy?.TextMarkType === 'tag') {
    addAttr(`data-type`, sy.TextMarkType ?? '')
  } else {
    addAttr(`data-type`, config?.data_type ?? sy.Type)
  }
  if (sy.Properties?.updated) addAttr('updated', sy.Properties.updated)
  if (config?.subtype_class) {
    if (typeof config.subtype_class === 'string') {
      addAttr('data-subtype', config.subtype_class)
      addAttr('class', config.subtype_class)
    } else {
      if (config.subtype_class[0] !== '')
        addAttr('data-subtype', config.subtype_class[0])
      if (config.subtype_class[1] !== '')
        addAttr('class', config.subtype_class[1])
    }
  }
  if (sy.Properties) {
    Object.entries(sy.Properties).forEach(([k, v]) => addAttr(k, v))
  }
  if (sy.ListData?.Marker) addAttr('data-marker', atob(sy.ListData.Marker))
  if (
    /** 任务列表 */ sy.ListData?.Typ === 3 &&
    /** 该项被选中 */ sy.Children?.find(
      (el) => el.Type === 'NodeTaskListItemMarker',
    )?.TaskListItemChecked
  ) {
    attrObj['class'] = (attrObj['class'] ?? '') + ' protyle-task--done '
  }
  /** 不折叠任何项目 */ delete attrObj['fold']
  /** 避免任意元素上悬停都显示文档标题 */
  if (sy.Type === 'NodeDocument') delete attrObj['title']
  return Object.entries(attrObj)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ')
}
/** 返回空字符串，一般用于不用解析的节点 */
const _emptyString = async (_sy: S_Node) => ''
const _dataString = async (sy: S_Node) => sy.Data ?? ''

const render: {
  [key in keyof typeof NodeType]?: (sy: S_Node) => Promise<string>
} & {
  /** 用于保存调用栈，
   * 例如在渲染 文档A中引用了文档B中的节点 时调用栈如下
   * ```
   *    nodeStack ~= [A_NodeDocument,A_NodeList,...,A_block-ref,B_Node]
   * ```
   * 对render中的函数意味着 `this.nodeStack[0]===需要生成的文档`
   * 这样就方便解决 block-ref 等链接问题
   * */
  nodeStack: S_Node[]
  /** 返回当前文档到顶层文档的路径前缀,例如： ./../..  */
  getTopPathPrefix: (sy_doc?: S_Node) => Promise<string>
} = {
  nodeStack: [] as S_Node[],
  async getTopPathPrefix() {
    const sy = this.nodeStack[0]
    let prefix = '.'
    if (sy.Type === 'NodeDocument' && sy.ID) {
      /** 基于当前文档路径将 href ../ 到顶层 */
      const path = await storeDep.getDocPathBySY(sy)
      if (path) {
        /** path data/box_id/doc_id/doc_id/doc_id.sy `data/box_id/` 这一节是多出来的，所以要减3 */
        const level = path.split('/').length - 3
        for (let i = 0; i < level; i++) {
          prefix += '/..'
        }
      }
      return prefix
    } else {
      console.log('未定义顶层元素非 NodeDocument 时的处理方式', sy)
      return ''
    }
  },
  async NodeDocument(sy) {
    let html = ''
    if (/** 只有顶层的文档块才渲染题图 */ this.nodeStack.length === 1) {
      html += `<div class="protyle-background protyle-background--enable" style="min-height: 150px;" ${strAttr(
        sy,
      )}>`
      if (sy.Properties?.['title-img']) {
        html += `<div class="protyle-background__img" style="margin-bottom: 30px;position: relative;height: 16vh;${
          sy.Properties?.['title-img']
        }"/>${
          sy.Properties?.['icon']
            ? `<div style="position: absolute;bottom:-10px;left:15px;height: 80px;width: 80px;transition: var(--b3-transition);cursor: pointer;font-size: 68px;line-height: 80px;text-align: center;font-family: var(--b3-font-family-emoji);margin-right: 16px;"> &#x${sy.Properties?.['icon']} </div>`
            : ''
        }</div>`
      }
      /** h1 文档标题 */
      html += `<div ${strAttr(sy)} data-type="NodeHeading" class="h1">${
        sy.Properties?.title
      }</div>`
    }
    html += await childRender(sy, this)
    return html
  },
  async NodeHeading(sy) {
    let html = `<div ${strAttr(sy)}><div>${await childRender(
      sy,
      this,
    )}</div></div>`

    // 在被嵌入查询块的情况下需要查询渲染其后面的非标题块
    const parentNode =
      this.nodeStack[
        this.nodeStack.length -
          2 /** 最后一个元素是 sy本身(NodeHeading)还得要往前一个，所以是2 */
      ]

    if (parentNode?.Type === 'NodeBlockQueryEmbedScript') {
      let afterFlag = false
      for (const node of sy.Parent.Children ?? []) {
        if (node === sy) {
          afterFlag = true
        } else if (node !== sy && node.Type === 'NodeHeading') {
          afterFlag = false
        } else if (afterFlag) {
          html += '\n' + (await renderHTML(node, this))
        }
      }
    }
    return html
  },
  NodeText: _dataString,
  async NodeList(sy) {
    return html`<div ${strAttr(sy)}>${await childRender(sy, this)}</div>`
  },
  async NodeListItem(sy) {
    return html`<div ${await strAttr(sy)}>
      <div class="protyle-action">
        ${
          sy.ListData?.Typ === 1
            ? /** 有序列表 */ atob(sy.ListData?.Marker ?? '')
            : sy.ListData?.Typ === 3
            ? /** 任务列表 */ `<svg><use xlink:href="#${
                sy.Children?.find((el) => el.Type === 'NodeTaskListItemMarker')
                  ?.TaskListItemChecked
                  ? 'iconCheck'
                  : 'iconUncheck'
              }"></use></svg>`
            : /** 无序列表 */ `<svg><use xlink:href="#iconDot"></use></svg>`
        }
      </div>
      ${await childRender(sy, this)}
    </div>`
  },
  NodeTaskListItemMarker: _emptyString,

  async NodeParagraph(sy) {
    return html`<div ${strAttr(sy)}>${await childRender(sy, this)}</div>`
  },
  async NodeTextMark(sy) {
    const that = this
    let r: string = ''
    /** 从后向前渲染每一层mark ，TextMarkType有可能是 `a sub` |`sub a` | `a` |`code`等 */
    for (const type of (
      sy.TextMarkType?.split(' ') ?? []
    ).reverse() as S_Node['TextMarkType'][]) {
      if (r === '') {
        r = await TextMarkRender(sy, type, sy.TextMarkTextContent ?? '')
      } else {
        r = await TextMarkRender(sy, type, r)
      }
    }
    return r
    async function TextMarkRender(
      sy: S_Node,
      type: S_Node['TextMarkType'],
      content: string,
    ): Promise<string> {
      if (type === 'inline-math') {
        return `<span data-type="inline-math" data-subtype="math" data-content="${sy.TextMarkInlineMathContent}" class="render-node"></span>`
      } else if (type === 'inline-memo' /** 备注 */) {
        return `${content}<sup>（${sy.TextMarkInlineMemoContent}）</sup>`
      } else if (type === 'block-ref' /** 引用块 */) {
        let href = ''
        if (sy.TextMarkBlockRefID) {
          const doc = await storeDep.getDocByChildID(sy.TextMarkBlockRefID)
          if (doc?.ID) {
            href = `${await that.getTopPathPrefix()}${await storeDep.getHPathByID_Node(
              doc /** 要先定位到文档，再通过下面的hash（#）定位到具体元素 */,
            )}.html#${sy.TextMarkBlockRefID}`
          } else {
            warn('未查找到所指向的文档节点', sy)
          }
        } else {
          warn('未查找到所指向的文档节点', sy)
        }

        return `<span data-type="${sy.TextMarkType}" \
    data-subtype="${/** "s" */ sy.TextMarkBlockRefSubtype}" \
    data-id="${/** 被引用块的id */ sy.TextMarkBlockRefID}">
          <a href="${href}">${content}</a>
  </span>`
      } else if (type === 'a') {
        let href = sy.TextMarkAHref
        if (href?.startsWith('assets/')) {
          /** TODO 应该有一个统一处理资源的方案 */
          href = `${await that.getTopPathPrefix()}/${href}`
        }
        return `<a href="${href}">${content}</a>`
      } else if (
        `strong em u s mark sup sub kbd tag code strong code text`.includes(
          type ?? '',
        )
      ) {
        return `<span ${strAttr(sy, { data_type: type })}>${content}</span>`
      } else {
        console.warn(
          '没有找到对应的渲染器 NodeTextMark.TextMarkType',
          sy.TextMarkType,
          that.nodeStack,
        )
        return ''
      }
    }
  },
  async NodeImage(sy) {
    let link = ''
    const LinkDest = sy.Children?.filter((c) => c.Type === 'NodeLinkDest')
    if (LinkDest?.length === 1) {
      link = await renderHTML(LinkDest[0], this)
    } else if (LinkDest?.length && LinkDest.length > 1) {
      console.log('NodeImage 存在多个 LinkDest', sy)
    }

    let title = ''
    const LinkTitle = sy.Children?.filter((c) => c.Type === 'NodeLinkTitle')
    if (LinkTitle?.length === 1) {
      title = await renderHTML(LinkTitle[0], this)
    } else if (LinkTitle?.length && LinkTitle.length > 1) {
      console.log('NodeImage 存在多个 LinkTitle', sy)
    }
    return html`<span ${await strAttr(sy)} style="${
      sy.Properties?.['parent-style']
    }"
      ><img
        src="${link}"
        data-src="${link}"
        title="${title}"
        style="${sy.Properties?.style}"
        loading="lazy"
      /><span class="protyle-action__title">${title}</span></span
    >`
  },
  async NodeLinkDest(sy) {
    return `${await this.getTopPathPrefix()}/${sy.Data}`
  },
  NodeLinkTitle: _dataString,
  NodeKramdownSpanIAL: _emptyString,
  async NodeSuperBlock(sy) {
    return html`<div
      ${strAttr(sy)}
      data-sb-layout="${childDateByType(sy, 'NodeSuperBlockLayoutMarker')}"
    >
      ${await childRender(sy, this)}
    </div>`
  },
  NodeSuperBlockOpenMarker: _emptyString,
  NodeSuperBlockCloseMarker: _emptyString,
  NodeSuperBlockLayoutMarker: _emptyString,
  async NodeBlockQueryEmbed(sy) {
    return `<div ${strAttr(sy)} data-type="NodeBlockquote" class="bq">\
${await childRender(sy, this)}\
</div>`
  },
  NodeOpenBrace: _emptyString,
  NodeCloseBrace: _emptyString,
  async NodeBlockQueryEmbedScript(sy) {
    const sql = sy.Data
    if (!sql) {
      console.log('no sql', sy)
      return html`<pre>${sql}</pre>`
    }
    let htmlStr = ''
    const blocks: DB_block[] = await API.query_sql({
      stmt: /** sql 被思源转义了，类似 ：SELECT * FROM blocks WHERE id = &#39;20201227174241-nxny1tq&#39;
      所以这里将它转义回来
      TODO 当用户确实使用了包含转义的字符串时，这个实现是错误的 */ unescaping(
        sql,
      ).replace(
        /** 我不理解lute为什么这样实现 https://github.com/88250/lute/blob/HEAD/editor/const.go#L38
         * https://ld246.com/article/1696750832289
         */
        /_esc_newline_/g,
        '\n',
      ),
    }).catch((err) => {
      throw new Error(
        `sql error: ${err.message}\nrawSql:${sql}\nunescapingSql:${unescaping(
          sql,
        )}`,
      )
    })
    for (const block of blocks) {
      const node = await storeDep.getNodeByID(block.id)
      if (node === undefined) {
        // TODO 一般来说是跨笔记引用,但也有可能是 node.ts 中的缓存失效
        return warnDiv('跨笔记引用', block.id, sql, node)
      }
      htmlStr += await renderHTML(node, this)
    }

    return htmlStr
  },
  async NodeBlockquote(sy) {
    return html`<div ${strAttr(sy)}>${await childRender(sy, this)}</div>`
  },
  NodeBlockquoteMarker: _emptyString,
  NodeCodeBlock: async (sy) => {
    const [yes, _] = isRenderCode(sy)
    if (yes) {
      return `<div ${strAttr(sy)} data-content="${escaping(
        sy.Children?.find((el) => el.Type === 'NodeCodeBlockCode')?.Data ?? '',
      )}">
        <div spin="1"></div>
        <div class="protyle-attr" contenteditable="false"></div>
      </div>`
    }
    //TODO 语法高亮没有正确触发
    return `<div ${strAttr(sy)}>
        <div class="protyle-action">
          <span class="protyle-action--first protyle-action__language">
          ${await renderHTML(
            sy.Children?.find(
              (el) => el.Type === 'NodeCodeBlockFenceInfoMarker',
            ),
          )}
          </span>
            <span class="fn__flex-1"></span>
            <span class="protyle-icon protyle-icon--only protyle-action__copy">
            <svg><use xlink:href="#iconCopy"></use></svg>
          </span>
        </div>
        ${await renderHTML(
          sy.Children?.find((el) => el.Type === 'NodeCodeBlockCode'),
        )}
      </div>`
  },
  NodeCodeBlockFenceInfoMarker: async (sy) => atob(sy.CodeBlockInfo ?? ''),
  NodeCodeBlockCode: async (sy) =>
    `<div class="hljs" spellcheck="false">${sy.Data}</div>`,
  NodeCodeBlockFenceOpenMarker: _emptyString,
  NodeCodeBlockFenceCloseMarker: _emptyString,
  async NodeTable(sy) {
    return `<div ${strAttr(sy)}>
    <div>
      <table spellcheck="false">
        <colgroup>
        ${sy.TableAligns?.map(() => '<col />').join('')}
        </colgroup>
        ${await renderHTML(
          sy.Children?.find((el) => el.Type === 'NodeTableHead'),
        )}
        <tbody>
        ${(
          await Promise.all(
            sy.Children?.filter((el) => el.Type === 'NodeTableRow').map((el) =>
              renderHTML(el, this),
            ) ?? [],
          )
        ).join('\n')}
        </tbody>
      </table>
    </div>
  </div>`
  },
  async NodeTableHead(sy) {
    return `<${sy.Data}>${await childRender(sy, this)}</${sy.Data}>`
  },
  async NodeTableRow(sy) {
    return `<tr>${await childRender(sy, this)}</tr>`
  },
  async NodeTableCell(sy) {
    return `<td>${await childRender(sy, this)}</td>`
  },
  NodeHTMLBlock: async (sy) => `<div ${strAttr(sy)}>${sy.Data}</div>`,
  NodeThematicBreak: async (sy) => `<div ${strAttr(sy)}><div></div></div>`,
  NodeMathBlock: async (sy) => `<div ${strAttr(
    sy,
  )} data-content="${childDateByType(sy, 'NodeMathBlockContent')}">
    <div spin="1"></div>
  </div>`,
  NodeMathBlockOpenMarker: _emptyString,
  NodeMathBlockCloseMarker: _emptyString,
  async NodeIFrame(sy) {
    return ` <div ${strAttr(sy)}>
    <div class="iframe-content">
    ${
      /** 资源总是被复制到顶层目录，所以直接跳到顶层即可 */
      /** TODO 应该有一个统一处理资源的方案 */
      sy.Data?.replace(
        /src="assets\//,
        `src="${await this.getTopPathPrefix()}/assets\/`,
      )
    }
    </div>
  </div>`
  },
  async NodeVideo(sy) {
    return await this.NodeIFrame!(sy)
  },
  async NodeAudio(sy) {
    return await this.NodeIFrame!(sy)
  },
  /** 虚拟链接 */
  NodeHeadingC8hMarker: _emptyString,
  async NodeSoftBreak(_sy) {
    //TODO 此处实现应该有问题
    /** https://zh.wikipedia.org/wiki/零宽空格 */
    return '\u200B'
  },
  async NodeBr(sy) {
    return `<${sy.Data}>`
  },
  async NodeWidget(sy) {
    return `<div ${strAttr(
      sy,
    )}><img src="${await this.getTopPathPrefix()}/assets/widget/${
      sy.ID
    }.jpg"/></div>`
  },
}

/** 获取sy节点的child中第一个type类型节点的data */
function childDateByType(sy: S_Node, type: S_Node['Type']) {
  return sy.Children?.find((el) => el.Type === type)?.Data
}

function warn(...arg: any[]) {
  console.warn('\n', ...arg)
}
