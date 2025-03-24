import { Effect } from 'effect'
import { escaping, unescaping } from '~/util/escaping.ts'
import { EffectRender } from './EffectDep.ts'
import { API } from './siyuan_api.ts'
import { DB_block, NodeType, S_Node } from './siyuan_type.ts'

export type RenderHTML = typeof renderHTML
export type Render = Effect.Effect.Success<typeof renderProgram>

/** 将指定  S_Node 渲染成对应的 html 代码 */
export const renderHTML = (
  sy: S_Node | undefined,
  /**
   * renderHTML 内部会创建一个 renderInstance 的浅克隆
   * 用来维护 renderHTML.nodeStack 的正常运转
   */
  render?: Render,
) =>
  Effect.gen(function* () {
    if (sy === undefined) return ''
    const defaultRender = yield* getRender
    const renderInstance = render ?? defaultRender

    const renderObj: Render = {
      ...renderInstance,
      nodeStack: [
        /** 避免让所有的 renderInstance.nodeStack 是同一个对象 ，所以这里复制一个新的  */ ...renderInstance.nodeStack,
      ],
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
        `没有找到对应的渲染方法 ${sy.Type}  ${renderObj.nodeStack[0].Properties?.title}`,
      )
    } else {
      /** 入栈 */
      renderObj.nodeStack.push(sy)
      /** 维护引用关系 */
      if (sy.ID && renderInstance.nodeStack[0]?.ID) {
        const storeDep = yield* EffectRender
        const id = sy.ID
        const targetDoc = yield* Effect.tryPromise(() =>
          storeDep.getDocByChildID(id),
        )
        const currentDoc = renderInstance.nodeStack[0]
        if (
          targetDoc?.ID !== undefined &&
          targetDoc.ID !== currentDoc.ID &&
          currentDoc.ID
        ) {
          /** 代表这个节点不在当前文档中，却在编译currentDoc时出现了，所以 currentDoc依赖（正向引用）targetDoc  */
          // 记录引用 TODO 不应该在 render中之直接记录，该上报
          renderObj.refs.add(targetDoc.ID)
        }
      }
      const r = yield* Effect.tryPromise(() => renderObj[sy.Type]!(sy))
      /** 出栈 */
      renderObj.nodeStack.pop()
      return r
    }
  })

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

      if (sy.Type === 'NodeDocument') return ''
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

/** 对一些数据常量进行处理 */
export const getRender = Effect.gen(function* () {
  const render = yield* renderProgram
  return {
    ...render,
    nodeStack: [],
    refs: new Set(),
  } as Render
})

const renderProgram = Effect.gen(function* () {
  const storeDep = yield* EffectRender
  async function callChildRender(sy: S_Node, renderInstance: Render) {
    const children = sy?.Children ?? []

    // 1. 创建所有子节点的渲染任务（并发启动）
    const promises = children.map((el) =>
      Effect.runPromise(
        Effect.provideService(
          renderHTML(el, renderInstance),
          EffectRender,
          storeDep,
        ),
      ),
    )

    // 2. 等待所有任务完成，保持原顺序
    const results = await Promise.all(promises)

    // 3. 按顺序拼接结果
    return results.join('')
  }
  async function callRenderHTML(sy: S_Node | undefined, render?: Render) {
    return Effect.runPromise(
      Effect.provideService(renderHTML(sy, render), EffectRender, storeDep),
    )
  }

  const render: {
    [key in keyof typeof NodeType]?: (sy: S_Node) => Promise<string>
  } & {
    /**
     * 用于保存调用栈，即从根节点到当前节点。
     * 例如在渲染 文档A中引用了文档B中的节点 时调用栈如下
     * ```
     *    nodeStack ~= [A_NodeDocument,A_NodeList,...,A_block-ref,B_Node]
     * ```
     * 对render中的函数意味着 `this.nodeStack[0]===需要生成的文档`
     * 这样就方便解决 block-ref 等链接问题
     * */
    nodeStack: S_Node[]
    /** 当前实例所引用的其他文档id，在渲染中计算 */
    refs: Set<string>
    /** 返回当前文档到顶层文档的路径前缀,例如： ./../..  */
    getTopPathPrefix: (sy_doc?: S_Node) => Promise<string>
  } = {
    nodeStack: [] as S_Node[],
    refs: new Set(),
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
      /** 对于顶层文档，也就是当前html的主要内容，渲染题头图和标题等其他信息，相比被嵌入的 doc 块需要做一些特殊处理  */
      const isTopDoc = this.nodeStack.length === 1

      let html = `<div style="min-height: 150px;" ${strAttr(sy)}>\n${
        /** 题头图 */
        isTopDoc && sy.Properties?.['title-img']
          ? `<div class="protyle-background__img" style="margin-bottom: 30px;position: relative;height: 16vh;${sy.Properties?.[
              'title-img'
            ].replace(
              /assets/,
              //  修改为相对路径
              (await this.getTopPathPrefix()) + '/assets',
            )}"/>${
              sy.Properties?.['icon']
                ? `<div style="position: absolute;bottom:-10px;left:15px;height: 80px;width: 80px;transition: var(--b3-transition);cursor: pointer;font-size: 68px;line-height: 80px;text-align: center;font-family: var(--b3-font-family-emoji);margin-right: 16px;"> &#x${sy.Properties?.['icon']} </div>`
                : ''
            }</div>`
          : ''
      }\n${
        /** h1 文档标题 */ isTopDoc
          ? `<h1 ${strAttr(sy)} data-type="NodeHeading" class="h1">${
              sy.Properties?.title
            }</h1>`
          : ''
      }\n${await callChildRender(sy, this)}</div>`
      /** 添加 protyle-wysiwyg 容器和侧边栏，这里面的才会得到对应的样式效果 */
      if (isTopDoc) {
        html = `<div class="protyle-wysiwyg protyle-wysiwyg--attr" id="preview">\n<div id="oceanpress-sidebar">侧边栏测试</div>\n${html}\n</div>`
      }
      return html
    },
    async NodeHeading(sy) {
      const tagName = `h${sy.HeadingLevel}`
      let html = `<${tagName} ${strAttr(sy)}>${await callChildRender(
        sy,
        this,
      )}</${tagName}>`

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
            html += '\n' + (await callRenderHTML(node, this))
          }
        }
      }
      return html
    },
    NodeText: _dataString,
    async NodeList(sy) {
      return html`<div ${strAttr(sy)}>${await callChildRender(sy, this)}</div>`
    },
    async NodeListItem(sy) {
      return html`<div ${await strAttr(sy)}>
        <div class="protyle-action">
          ${
            sy.ListData?.Typ === 1
              ? /** 有序列表 */ atob(sy.ListData?.Marker ?? '')
              : sy.ListData?.Typ === 3
              ? /** 任务列表 */ `<svg><use xlink:href="#${
                  sy.Children?.find(
                    (el) => el.Type === 'NodeTaskListItemMarker',
                  )?.TaskListItemChecked
                    ? 'iconCheck'
                    : 'iconUncheck'
                }"></use></svg>`
              : /** 无序列表 */ `<svg><use xlink:href="#iconDot"></use></svg>`
          }
        </div>
        ${await callChildRender(sy, this)}
      </div>`
    },
    NodeTaskListItemMarker: _emptyString,

    async NodeParagraph(sy) {
      /** .protyle-wysiwyg [data-node-id] [spellcheck] 定义了换行样式 */
      return `<div ${strAttr(
        sy,
      )}><div spellcheck="false">${await callChildRender(sy, this)}</div></div>`
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
              that.refs.add(doc.ID)
            } else {
              warn(`未查找到${sy.ID}所指向的文档节点 ${sy.TextMarkBlockRefID}`)
            }
          } else {
            warn(`${sy.ID} 块引用没有设定 ref id`)
          }

          return `<span data-type="${sy.TextMarkType}" \
  data-subtype="${/** "s" */ sy.TextMarkBlockRefSubtype}" \
  data-id="${
    /** 被引用块的id */ sy.TextMarkBlockRefID
  }"><a href="${href}">${content}</a></span>`
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
          return warnDiv(
            `没有找到对应的渲染器 ${sy.TextMarkType}  ${that.nodeStack[0].Properties?.title}`,
          )
        }
      }
    },
    async NodeImage(sy) {
      let link = ''
      const LinkDest = sy.Children?.filter((c) => c.Type === 'NodeLinkDest')
      if (LinkDest?.length === 1) {
        link = await callRenderHTML(LinkDest[0], this)
      } else if (LinkDest?.length && LinkDest.length > 1) {
        warn('NodeImage 存在多个 LinkDest', sy)
      }

      let title = ''
      const LinkTitle = sy.Children?.filter((c) => c.Type === 'NodeLinkTitle')
      if (LinkTitle?.length === 1) {
        title = await callRenderHTML(LinkTitle[0], this)
      } else if (LinkTitle?.length && LinkTitle.length > 1) {
        warn('NodeImage 存在多个 LinkTitle', sy)
      }
      return `<span ${await strAttr(sy)} style="${
        sy.Properties?.['parent-style'] ?? ''
      }">
  <img
    src="${link}"
    data-src="${link}"
    title="${title}"
    style="${sy.Properties?.style ?? ''}"
    loading="lazy"
  />
  <span class="protyle-action__title">${title}</span></span>`
    },
    async NodeLinkDest(sy) {
      /** 绝对路径 */
      if (/^(?:[a-z]+:)?\/\/|^(?:\/)/.test(sy.Data ?? '')) {
        return sy.Data ?? ''
      }
      /** 为相对路径添加正确的前缀 */
      return `${await this.getTopPathPrefix()}/${sy.Data}`
    },
    NodeLinkTitle: _dataString,
    NodeKramdownSpanIAL: _emptyString,
    async NodeSuperBlock(sy) {
      return `<div ${strAttr(sy)} data-sb-layout="${childDateByType(
        sy,
        'NodeSuperBlockLayoutMarker',
      )}">${await callChildRender(sy, this)}</div>`
    },
    NodeSuperBlockOpenMarker: _emptyString,
    NodeSuperBlockCloseMarker: _emptyString,
    NodeSuperBlockLayoutMarker: _emptyString,
    async NodeBlockQueryEmbed(sy) {
      return `<div ${strAttr(sy)} data-type="NodeBlockquote" class="bq">\
  ${await callChildRender(sy, this)}\
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
          return warnDiv('未找到此块，可能为跨笔记引用', block.id, sql)
        }
        htmlStr += await callRenderHTML(node, this)
      }

      return htmlStr
    },
    async NodeBlockquote(sy) {
      return html`<div ${strAttr(sy)}>${await callChildRender(sy, this)}</div>`
    },
    NodeBlockquoteMarker: _emptyString,
    NodeCodeBlock: async function (sy) {
      const [yes, _] = isRenderCode(sy)
      if (yes) {
        return `<div ${strAttr(sy)} data-content="${escaping(
          sy.Children?.find((el) => el.Type === 'NodeCodeBlockCode')?.Data ??
            '',
        )}">
          <div spin="1"></div>
          <div class="protyle-attr" contenteditable="false"></div>
        </div>`
      }
      return `<div ${strAttr(sy)}>
          <div class="protyle-action">
            <span class="protyle-action--first protyle-action__language">${await callRenderHTML(
              sy.Children?.find(
                (el) => el.Type === 'NodeCodeBlockFenceInfoMarker',
              ),
              this,
            )}</span>
            <span class="fn__flex-1"></span><span class="protyle-icon protyle-icon--only protyle-action__copy"><svg><use xlink:href="#iconCopy"></use></svg></span>
          </div>
          ${await callRenderHTML(
            sy.Children?.find((el) => el.Type === 'NodeCodeBlockCode'),
            this,
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
          ${await callRenderHTML(
            sy.Children?.find((el) => el.Type === 'NodeTableHead'),
            this,
          )}
          <tbody>
          ${(
            await Promise.all(
              sy.Children?.filter((el) => el.Type === 'NodeTableRow').map(
                (el) => callRenderHTML(el, this),
              ) ?? [],
            )
          ).join('\n')}
          </tbody>
        </table>
      </div>
    </div>`
    },
    async NodeTableHead(sy) {
      return `<${sy.Data}>${await callChildRender(sy, this)}</${sy.Data}>`
    },
    async NodeTableRow(sy) {
      return `<tr>${await callChildRender(sy, this)}</tr>`
    },
    async NodeTableCell(sy) {
      return `<td>${await callChildRender(sy, this)}</td>`
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
    async NodeBackslash(sy) {
      if (sy.Data === undefined || sy.Data === 'span') {
        return `${await callChildRender(sy, this)}`
      } else {
        return warnDiv(
          `未定义的 NodeBackslash 处理 ${sy.Data}`,
          this.nodeStack[0].Properties?.title,
        )
      }
    },
    NodeBackslashContent: _dataString,
  }

  return render
})

/** 获取sy节点的child中第一个type类型节点的data */
function childDateByType(sy: S_Node, type: S_Node['Type']) {
  return sy.Children?.find((el) => el.Type === type)?.Data
}

function warn(...arg: any[]) {
  console.warn('\n', ...arg)
}
