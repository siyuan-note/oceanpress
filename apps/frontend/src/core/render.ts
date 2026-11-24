import { Context, Effect } from 'effect'
import { escaping, unescaping } from '~/util/escaping.ts'
import { EffectConfigDep, EffectRender } from './EffectDep.ts'
import { API } from './siyuan_api.ts'
import { DB_block, NodeType, S_Node } from './siyuan_type.ts'
import { renderDocTreeJsPath } from './renderDocTree.ts'
import { tagPageFileName } from './renderTagPage.ts'

export type RenderHTML = typeof renderHTML
export type Render = Effect.Success<typeof renderProgram>

/** 上一篇/下一篇导航项 */
export type PagerItem = { title: string; url: string }

/** HTML 属性值转义 */
function escapeAttr(s: string | undefined) {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
/** HTML 文本转义 */
function escapeText(s: string | undefined) {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
/** 从 Kramdown 行级属性列表（如 `{: style="text-align: center;"}`）中解析对齐方式 */
function parseKramdownAlign(data?: string) {
  const m = /text-align\s*:\s*(left|center|right|justify)/.exec(data ?? '')
  return m?.[1]
}

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
          renderObj.refs.add(targetDoc.ID)
        }
      }
      const r = yield* Effect.tryPromise(() =>
        renderObj[sy.Type]!(sy).catch((err) => {
          if (err instanceof Error) err.message += `\n  <- 渲染失败节点 ${sy.Type} id=${sy.ID} doc=${renderObj.nodeStack[0]?.Properties?.title}`
          throw err
        }),
      )
      /** 出栈 */
      renderObj.nodeStack.pop()
      return r
    }
  })

function warnDiv(msg: string, ...args: any[]) {
  warn(msg, ...args)
  return `<div class="op-warn">${escapeText(msg)}</div>`
}

/** 判断代码块是否为需要在浏览器端渲染的图表类代码块，返回 [是否, 语言] */
function isRenderCode(sy: S_Node) {
  const mark = atob(
    sy.CodeBlockInfo ??
      sy.Children?.find((el) => el.Type === 'NodeCodeBlockFenceInfoMarker')
        ?.CodeBlockInfo ??
      '',
  ).trim()
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

      if (sy.Type === 'NodeDocument') return ['', 'op-doc']
      else if (sy.Type === 'NodeHeading') return `h${sy.HeadingLevel}`
      else if (sy.Type === 'NodeMindmap') return ['', 'list op-mindmap']
      else if (sy.Type === 'NodeMindmapItem') return ['', 'li']
      else if (sy.Type === 'NodeTabs') return ['', 'op-tabs']
      else if (sy.Type === 'NodeTabItem') return ['', 'op-tab']
      else if (sy.Type === 'NodeList' && isMindmapNode(sy)) return ['', 'list op-mindmap']
      else if (sy.Type === 'NodeList') return [typ_subtype, 'list']
      else if (sy.Type === 'NodeListItem') return [typ_subtype, 'li']
      else if (sy.Type === 'NodeParagraph') return ['', 'p']
      else if (sy.Type === 'NodeImage') return ['', 'img']
      else if (sy.Type === 'NodeBlockquote') return ['', 'bq']
      else if (sy.Type === 'NodeBlockQueryEmbed') return ['', 'op-embed']
      else if (sy.Type === 'NodeSuperBlock') return ['', 'sb']
      else if (sy.Type === 'NodeCallout') return ['', 'op-callout']
      else if (sy.Type === 'NodeCodeBlock') {
        const [yes, mark] = isRenderCode(sy)
        if (yes) {
          /** 脑图等需要渲染的块 */
          return [mark, 'render-node']
        } else {
          return ['', 'code-block']
        }
      }
      else if (sy.Type === 'NodeTable') return ['', 'table op-table']
      else if (sy.Type === 'NodeThematicBreak') return ['', 'hr']
      else if (sy.Type === 'NodeMathBlock') return ['math', 'render-node']
      else if (sy.Type === 'NodeIFrame') return ['', 'iframe']
      else if (sy.Type === 'NodeVideo') return ['video', 'iframe']
      else if (sy.Type === 'NodeAudio') return ['audio', 'iframe']
      else return ''
    })()
  }
  const attrObj: { [k: string]: string } = {}
  function addAttr(key: string, value: string) {
    attrObj[key] = value
  }
  if (sy.ID) {
    addAttr('id', sy.ID)
    addAttr('data-node-id', sy.ID)
  }

  if (sy?.TextMarkType === 'tag') {
    addAttr('data-type', sy.TextMarkType ?? '')
  } else {
    addAttr('data-type', config?.data_type ?? sy.Type)
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
    /** 思源导出的属性值本身已是 HTML 转义态，直接输出会变成 &amp;quot; 二次转义，先还原再统一转义 */
    Object.entries(sy.Properties).forEach(([k, v]) =>
      addAttr(k, unescaping(v ?? '')),
    )
  }
  if (sy.ListData?.Marker && sy.Type === 'NodeListItem')
    addAttr('data-marker', decodeMarker(sy.ListData.Marker))
  if (sy.ListData?.Start && sy.ListData.Start !== 1)
    addAttr('data-start', String(sy.ListData.Start))
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
  if (sy.Type !== 'NodeHeading') delete attrObj['title']
  return Object.entries(attrObj)
    .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
    .join(' ')
}
/** 返回空字符串，一般用于不用解析的节点 */
const _emptyString = async (_sy: S_Node) => ''
const _dataString = async (sy: S_Node) => sy.Data ?? ''

/** 列表标记在旧版思源里是 base64，新版直接是明文（如 - * 1.），解不动就按明文返回 */
function decodeMarker(marker: string): string {
  if (/^[\x20-\x7e]+$/.test(marker)) return marker
  try {
    return atob(marker)
  } catch {
    return marker
  }
}

/** 列表节点是否为思维导图：新版用独立节点类型，旧版是带 custom-sy-list-mindmap 属性的列表 */
function isMindmapNode(sy: S_Node) {
  return (
    sy.Type === 'NodeMindmap' ||
    sy.Properties?.['custom-sy-list-mindmap'] === '1'
  )
}

/** 行内 HTML 标签名 → 思源 TextMarkType，页签标题等字段存的是行内 HTML 而非 markdown */
const INLINE_TAG_MARK: Record<string, S_Node['TextMarkType']> = {
  strong: 'strong',
  b: 'strong',
  em: 'em',
  i: 'em',
  u: 'u',
  s: 's',
  mark: 'mark',
  sup: 'sup',
  sub: 'sub',
  kbd: 'kbd',
  code: 'code',
}

/** 由行内 HTML 合成的行内节点，没有 Parent/TypeStr 这些由文档树重建时才补的字段 */
type InlineSynthNode = Pick<S_Node, 'Type'> &
  Partial<Pick<S_Node, 'Data' | 'TextMarkType' | 'TextMarkTextContent'>>

/** 渲染器支持的全部行内标记类型，用于校验 data-type 这种可被插件扩展的任意字符串 */
const INLINE_MARK_TYPES = new Set([
  'block-ref',
  'a',
  'tag',
  'inline-math',
  'inline-memo',
  'strong',
  'em',
  'u',
  's',
  'mark',
  'sup',
  'sub',
  'kbd',
  'code',
  'file-annotation-ref',
])

/**
 * 把思源存的行内 HTML（如页签标题 `<span data-type="strong">x</span>y`）解析成行内节点，
 * 交给正常行内渲染，保留加粗等样式
 */
function parseInlineHtml(src: string): InlineSynthNode[] {
  const nodes: InlineSynthNode[] = []
  const re = /<([a-z]+)([^>]*)>([\s\S]*?)<\/\1>|([^<]+)/g
  for (const m of src.matchAll(re)) {
    if (m[4] !== undefined) {
      nodes.push({ Type: 'NodeText', Data: unescaping(m[4]) })
      continue
    }
    const typeAttr = /data-type="([^"]*)"/.exec(m[2])?.[1]
    const markType =
      INLINE_TAG_MARK[m[1]] ??
      (INLINE_MARK_TYPES.has(typeAttr ?? '')
        ? (typeAttr as S_Node['TextMarkType'])
        : undefined)
    const text = unescaping(m[3].replace(/<[^>]+>/g, ''))
    nodes.push({
      Type: 'NodeTextMark',
      TextMarkType: markType,
      TextMarkTextContent: text,
    })
  }
  return nodes
}

/**
 * 思维导图节点：思源的导图就是一个带 custom-sy-list-mindmap 的嵌套列表，
 * 这里提取成树交给前端画 SVG
 */
type MindmapNode = { id: string; text: string; children: MindmapNode[] }

/** 取列表项第一段段落块的纯文本作为导图节点文字 */
function mindmapItemText(item: S_Node): string {
  const para = item.Children?.find((c) => c.Type === 'NodeParagraph')
  return para ? collectText(para, { text: '', tags: new Set() }).text.trim() : ''
}

/** 列表 → 导图树：每个 NodeListItem 是一个节点，其下的 NodeList 是子节点 */
function mindmapFromList(list: S_Node): MindmapNode[] {
  const items = list.Children?.filter((c) => c.Type === 'NodeListItem') ?? []
  return items.map((item) => {
    const sub = item.Children?.find(
      (c) => c.Type === 'NodeList' || c.Type === 'NodeMindmapItem',
    )
    return {
      id: item.ID ?? '',
      text: mindmapItemText(item),
      children: sub ? mindmapFromList(sub) : [],
    }
  })
}

/** 输出导图容器：树形数据放 data-mindmap；与思源一致，列表第一项是中心主题，无脚本时降级为嵌套列表 */
async function renderMindmap(sy: S_Node) {
  const tree = mindmapFromList(sy)
  /** 没有任何列表项时给一个空中心主题，保证导图结构合法 */
  const root: MindmapNode = tree[0] ?? {
    id: sy.ID ?? '',
    text: '',
    children: [],
  }
  /** 第一项之外的顶层项视为中心主题的兄弟分支，挂在中心主题下 */
  root.children = [...root.children, ...tree.slice(1)]
  return `<div ${strAttr(sy)} data-mindmap="${escapeAttr(
    JSON.stringify(root),
  )}"><ul class="op-mindmap__fallback">${mindmapFallback(tree)}</ul></div>`
}

/** 导图无脚本时的降级展示：普通嵌套列表 */
function mindmapFallback(nodes: MindmapNode[]): string {
  if (nodes.length === 0) return ''
  return `<ul>${nodes
    .map(
      (n) =>
      `<li>${escapeText(n.text)}${mindmapFallback(n.children)}</li>`,
    )
    .join('')}</ul>`
}

/** 当前列表项在父列表中的序号（从 0 起），用于有序列表编号 */
function listIndexAmongSiblings(sy: S_Node): number {
  const siblings = sy.Parent?.Children ?? []
  let i = 0
  for (const s of siblings) {
    if (s === sy) return i
    if (s.Type === 'NodeListItem') i++
  }
  return i
}

/** 将思源 updated 时间串（20230820185054）格式化为可读日期 */
function formatSYDate(syDate: string): string {
  const y = syDate.slice(0, 4)
  const m = syDate.slice(4, 6)
  const d = syDate.slice(6, 8)
  if (!y || !m || !d) return syDate
  return `${y}-${m}-${d}`
}

/** 从块 ID 前 14 位还原创建日期 */
export function idToDate(id?: string) {
  return id && id.length >= 14 ? formatSYDate(id) : ''
}

/** 由当前文档指向某个标签页的站内路径（不含层级前缀），例如 /tags/好文推荐.html */
function tagPagePath(tag: string) {
  return `/tags/${tagPageFileName(tag)}.html`
}

/** 递归收集文档内的纯文本与标签 */
export function collectText(sy: S_Node, acc: { text: string; tags: Set<string> }) {
  if (sy.Type === 'NodeTextMark') {
    acc.text += sy.TextMarkTextContent ?? ''
    if (sy.TextMarkType?.split(' ').includes('tag')) {
      acc.tags.add(sy.TextMarkTextContent ?? '')
    }
  } else if (sy.Type === 'NodeText' || sy.Type === 'NodeCodeBlockCode') {
    acc.text += sy.Data ?? ''
  }
  if (sy.Type === 'NodeHeading') acc.text += ' '
  for (const child of sy.Children ?? []) collectText(child, acc)
  return acc
}

/** 递归收集文档内的标题（跳过嵌入块内部，避免目录混入被引用文档的标题） */
function collectHeadings(
  sy: S_Node,
  acc: { id: string; level: number; text: string }[],
) {
  if (sy.Type === 'NodeBlockQueryEmbed' || sy.Type === 'NodeSuperBlock') {
    return
  }
  if (sy.Type === 'NodeHeading' && sy.HeadingLevel && sy.HeadingLevel > 1 && sy.ID) {
    acc.push({
      id: sy.ID,
      level: sy.HeadingLevel,
      text: collectText(sy, { text: '', tags: new Set() }).text.trim(),
    })
  }
  for (const child of sy.Children ?? []) collectHeadings(child, acc)
}

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
  const config = yield* EffectConfigDep
  /** 当前编译的笔记本 id；block-ref / 嵌入块 / 数据库用它判断目标是否跨笔记本 */
  const notebookId: string = config.notebook.id
  const context = Context.empty().pipe(
    Context.add(EffectRender, storeDep),
    Context.add(EffectConfigDep, config),
  )
  async function callChildRender(sy: S_Node, renderInstance: Render) {
    const children = sy?.Children ?? []

    // 1. 创建所有子节点的渲染任务（并发启动）
    const promises = children.map((el) =>
      Effect.runPromise(
        Effect.provide(renderHTML(el, renderInstance), context),
      ),
    )

    // 2. 等待所有任务完成，保持原顺序
    const results = await Promise.all(promises)

    // 3. 按顺序拼接结果
    return results.join('')
  }
  async function callRenderHTML(sy: S_Node | undefined, render?: Render) {
    return Effect.runPromise(Effect.provide(renderHTML(sy, render), context))
  }

  /** 渲染行内 HTML 源码（如页签标题）为可输出的 HTML，解析不出节点时退回纯文本 */
  async function renderInlineHtml(src: string, render: Render) {
    const nodes = parseInlineHtml(src)
    if (nodes.length === 0) return escapeText(src)
    const parts = await Promise.all(
      nodes.map((n) =>
        callRenderHTML(
          /** 合成节点只用到行内渲染会读的字段 */
          n as S_Node,
          render,
        ),
      ),
    )
    return parts.join('')
  }

  /** 嵌入块脚本实际命中的块（与渲染共用同一套 sql 转义规则） */
  async function queryEmbedBlocks(script: S_Node): Promise<DB_block[]> {
    const sql = script.Data
    if (!sql) return []
    const blocks: DB_block[] = await API.query_sql({
      stmt: unescaping(sql).replace(/_esc_newline_/g, '\n'),
    })
    return blocks
  }

  /** 将块 id 解析为站内 html 链接（定位到文档 + 锚点），解析失败返回空串 */
  async function resolveSiYuanLink(id: string, renderInstance: Render) {
    const doc = await storeDep.getDocByChildID(id)
    if (doc?.ID === undefined) {
      warn(`未查找到所指向的文档节点 ${id}`)
      return ''
    }
    const href = `${await renderInstance.getTopPathPrefix()}${await storeDep.getHPathByID_Node(doc)}.html#${id}`
    renderInstance.refs.add(doc.ID)
    return href
  }

  /**
   * 引用目标是否不属于正在编译的笔记本
   * 跨笔记本的块只给出提示占位，不解析链接也不带出任何内容，避免把其他笔记本的数据发布到站点
   */
  async function isCrossNotebook(id: string) {
    const block = await storeDep.getBlockByID(id)
    return block !== undefined && block.box !== notebookId
  }
  /** 跨笔记本引用的统一占位：不带锚文本、不带链接 */
  function crossRefPlaceholder(kind: '引用' | '嵌入' | '条目') {
    return `<span class="op-cross-ref" title="该${kind}指向其他笔记本，为保护其内容不在此展示">跨笔记本${kind}</span>`
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
    /** 顶层文档的上一篇/下一篇，由 build 阶段注入 */
    pager?: { prev?: PagerItem; next?: PagerItem }
    /** 返回当前文档到顶层文档的路径前缀,例如： ./../.. */
    getTopPathPrefix: (sy_doc?: S_Node) => Promise<string>
    /** 三栏页面骨架：左文档树 / 中间正文 / 右侧栏。文档页与标签页共用，保证版式一致 */
    pageShell: (prefix: string, main: string, right: string) => string
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
    pageShell(prefix, main, right) {
      return `<div class="protyle-wysiwyg protyle-wysiwyg--attr" id="preview">
  <aside id="oceanpress-left-sidebar" class="op-sidebar">
    ${config.sidebarCode.leftCode}
    ${
      config.sidebarCode.enableDocTree
        ? `<div id="oceanpress-doctree"></div>
           <script>window.__OP_ROOT__=${JSON.stringify(prefix)};</script>
           <script src="${prefix}${renderDocTreeJsPath}" async></script>`
        : ''
    }
  </aside>
  ${main}
  <aside id="oceanpress-right-sidebar" class="op-sidebar">${config.sidebarCode.rightCode}${right}</aside>
</div>`
    },
    async NodeDocument(sy) {
      /** 对于顶层文档，也就是当前html的主要内容，渲染题头图和标题等其他信息，相比被嵌入的 doc 块需要做一些特殊处理 */
      const isTopDoc = this.nodeStack.length === 1
      const prefix = await this.getTopPathPrefix()
      const title = sy.Properties?.title ?? ''

      if (!isTopDoc) {
        return `<div ${strAttr(sy)}>${await callChildRender(sy, this)}</div>`
      }

      /** 题头图：思源把背景样式整体存在 title-img 里，其中的 assets 路径需要改为相对顶层 */
      const coverImg = sy.Properties?.['title-img']
      const cover = coverImg
        ? `<div class="protyle-background__img op-cover" style="${escapeAttr(
            unescaping(coverImg).replace(/assets\//g, `${prefix}/assets/`),
          )}"></div>`
        : ''

      const iconCode = sy.Properties?.icon ?? ''
      const icon = iconCode
        ? `<span class="op-doc-header__icon">&#x${escapeAttr(iconCode)};</span>`
        : ''

      /** 面包屑：思源 hpath 的每一段就是祖先文档名 */
      let breadcrumb = ''
      if (config.site.breadcrumb) {
        const hpath = await storeDep.getHPathByID_Node(sy)
        const segments = hpath.split('/').filter((s) => s)
        const crumbs = [
          `<a class="op-breadcrumb__item" href="${prefix}/">${escapeText(
            config.site.title || config.notebook.name || '首页',
          )}</a>`,
        ]
        let current = ''
        for (const [i, segment] of segments.entries()) {
          current += '/' + segment
          const isLast = i === segments.length - 1
          /** 顶层首页文档就是第一项「站点标题」，不再重复显示，但路径必须保留 */
          const isHome = i === 0 && segment === 'index'
          if (isHome) continue
          crumbs.push(
            isLast
              ? `<span class="op-breadcrumb__item op-breadcrumb__item--current" aria-current="page">${escapeText(
                  decodeURIComponent(segment),
                )}</span>`
              : `<a class="op-breadcrumb__item" href="${encodeURI(
                  prefix + current,
                )}.html">${escapeText(decodeURIComponent(segment))}</a>`,
          )
        }
        breadcrumb = `<nav class="op-breadcrumb" aria-label="面包屑">${crumbs.join(
          '<span class="op-breadcrumb__sep">/</span>',
        )}</nav>`
      }

      /** 文章元信息：发布/更新时间、字数、阅读时长、标签 */
      let meta = ''
      if (config.site.docMeta) {
        const { text, tags } = collectText(sy, { text: '', tags: new Set() })
        const wordCount = text.replace(/\s+/g, '').length
        const readingMin = Math.max(1, Math.ceil(wordCount / 400))
        const items: string[] = []
        const created = idToDate(sy.ID)
        const updated = formatSYDate(sy.Properties?.updated ?? '')
        if (created)
          items.push(
            `<time datetime="${created}">${
              updated && updated !== created
                ? `发布于 ${created} · 更新于 ${updated}`
                : created
            }</time>`,
          )
        if (wordCount) items.push(`<span>约 ${wordCount} 字</span>`)
        if (wordCount) items.push(`<span>阅读约 ${readingMin} 分钟</span>`)
        const tagList = [...tags]
        meta = `<div class="op-doc-meta">${items
          .map((i) => `<span class="op-doc-meta__item">${i}</span>`)
          .join('')}${
          tagList.length
            ? `<span class="op-doc-meta__tags">${tagList
                .map(
                  (t) =>
                    `<a class="op-tag" href="${encodeURI(prefix + tagPagePath(t))}">#${escapeText(t)}</a>`,
                )
                .join('')}</span>`
            : ''
        }</div>`
      }

      /** 备忘录作为文章导语 */
      const memoText = (sy.Properties as Record<string, string> | undefined)?.memo
      const memo = memoText
        ? `<p class="op-doc-lead">${escapeText(memoText)}</p>`
        : ''

      /** 上一篇/下一篇 */
      let pager = ''
      if (config.site.pager && this.pager) {
        const { prev, next } = this.pager
        const item = (cls: string, label: string, p?: PagerItem) =>
          p
            ? `<a class="op-pager__item ${cls}" href="${encodeURI(prefix + p.url)}"><span class="op-pager__label">${label}</span><span class="op-pager__title">${escapeText(p.title)}</span></a>`
            : '<span class="op-pager__item op-pager__item--empty"></span>'
        pager = `<nav class="op-pager" aria-label="文章导航">${item(
          'op-pager__prev',
          '上一篇',
          prev,
        )}${item('op-pager__next', '下一篇', next)}</nav>`
      }

      /** 文内目录：构建期直接从标题生成（SEO 友好、无 JS 也可用），浏览器端只负责高亮当前项 */
      let toc = ''
      if (config.site.toc) {
        const headings: { id: string; level: number; text: string }[] = []
        collectHeadings(sy, headings)
        if (headings.length >= 2) {
          const minLevel = Math.min(...headings.map((h) => h.level))
          toc = `<nav class="op-toc" aria-label="目录"><div class="op-toc__title">目录</div>${headings
            .map(
              (h) =>
                `<a class="op-toc__item" data-level="${h.level - minLevel}" href="#${h.id}">${escapeText(h.text)}</a>`,
            )
            .join('')}</nav>`
        }
      }

      return this.pageShell(
        prefix,
        `<article ${strAttr(sy)}>
  ${cover}
  <header class="op-doc-header">
    <h1 id="${escapeAttr(sy.ID)}" data-node-id="${escapeAttr(sy.ID)}" data-type="NodeHeading" class="h1 op-doc-header__title">${icon}${escapeText(title)}</h1>
    ${breadcrumb}
    ${meta}
  </header>
  ${memo}
  <div class="op-doc-body">
${await callChildRender(sy, this)}
  </div>
  ${pager}
</article>`,
        toc,
      )
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
      if (isMindmapNode(sy)) return renderMindmap(sy)
      return html`<div ${strAttr(sy)}>${await callChildRender(sy, this)}</div>`
    },
    /** 思维导图（新版独立节点类型）：只输出树形数据，由 main.js 画成 SVG 横向导图 */
    NodeMindmap(sy) {
      return renderMindmap(sy)
    },
    async NodeListItem(sy) {
      return html`<div ${await strAttr(sy)}>
        <div class="protyle-action">
          ${
            sy.ListData?.Typ === 1
              ? /** 有序列表：按同级序号递增，支持 Start */ escapeText(
                  String(
                    (sy.ListData.Start ?? 1) + listIndexAmongSiblings(sy),
                  ) + '.',
                )
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
          return `<span data-type="inline-math" data-subtype="math" data-content="${escapeAttr(
            sy.TextMarkInlineMathContent,
          )}" class="render-node"></span>`
        } else if (type === 'inline-memo') {
          /** 备注：行内小气泡，悬停展示备注内容 */
          return `${content}<span class="op-memo" data-type="inline-memo" data-memo="${escapeAttr(
            sy.TextMarkInlineMemoContent,
          )}" title="${escapeAttr(
            sy.TextMarkInlineMemoContent,
          )}"></span>`
        } else if (type === 'block-ref') {
          let href = ''
          if (sy.TextMarkBlockRefID && (await isCrossNotebook(sy.TextMarkBlockRefID))) {
            return crossRefPlaceholder('引用')
          }
          if (sy.TextMarkBlockRefID) {
            href = await resolveSiYuanLink(sy.TextMarkBlockRefID, that)
            if (href === '') href = '#'
          } else {
            warn(`${sy.ID} 块引用没有设定 ref id`)
          }
          return `<span data-type="${sy.TextMarkType}" \
  data-subtype="${/** "s" 静态 "d" 动态 */ sy.TextMarkBlockRefSubtype}" \
  data-id="${
    /** 被引用块的id */ sy.TextMarkBlockRefID
  }" class="op-ref"><a href="${href}">${content}</a></span>`
        } else if (type === 'a') {
          let href = sy.TextMarkAHref ?? ''
          const titleAttr = sy.TextMarkATitle
            ? ` title="${escapeAttr(sy.TextMarkATitle)}"`
            : ''
          if (href.startsWith('assets/')) {
            /** TODO 应该有一个统一处理资源的方案 */
            href = `${await that.getTopPathPrefix()}/${href}`
          } else if (href.startsWith('siyuan://blocks/')) {
            const targetId = href.replace('siyuan://blocks/', '')
            if (await isCrossNotebook(targetId)) return crossRefPlaceholder('引用')
            href = await resolveSiYuanLink(targetId, that)
          }
          const external = /^(https?:)?\/\//.test(href)
          /** 思源给出的 href 已是编码后的形式，这里只做 HTML 转义，再 encodeURI 会把 % 编成 %25 */
          return `<a href="${escapeAttr(href)}"${titleAttr}${
            external ? ' target="_blank" rel="noopener"' : ''
          }>${content}</a>`
        } else if (type === 'tag') {
          return `<span data-type="tag" class="op-tag"><a href="${encodeURI(
            (await that.getTopPathPrefix()) + tagPagePath(content),
          )}">#${content}</a></span>`
        } else if (type === 'file-annotation-ref') {
          /** 文件注解引用：静态站点无法定位原文件中的注解，仅以标记形式保留锚文本 */
          return `<span data-type="file-annotation-ref" class="op-file-ref" title="文件注解引用">${content}</span>`
        } else if (type === 'strong') {
          return `<strong>${content}</strong>`
        } else if (type === 'em') {
          return `<em>${content}</em>`
        } else if (type === 'u') {
          return `<u>${content}</u>`
        } else if (type === 's') {
          return `<s>${content}</s>`
        } else if (type === 'mark') {
          return `<mark>${content}</mark>`
        } else if (type === 'sup') {
          return `<sup>${content}</sup>`
        } else if (type === 'sub') {
          return `<sub>${content}</sub>`
        } else if (type === 'kbd') {
          return `<kbd>${content}</kbd>`
        } else if (type === 'code') {
          return `<code data-type="code">${content}</code>`
        } else if (type === 'text') {
          return content
        } else {
          return warnDiv(
            `没有找到对应的渲染器 ${sy.TextMarkType}  ${that.nodeStack[0].Properties?.title}`,
          )
        }
      }
    },
    async NodeImage(sy) {
      const LinkDest = sy.Children?.filter((c) => c.Type === 'NodeLinkDest')
      const link =
        LinkDest?.length === 1 ? await callRenderHTML(LinkDest[0], this) : ''
      if (LinkDest && LinkDest.length > 1)
        warn('NodeImage 存在多个 LinkDest', sy)

      const LinkTitle = sy.Children?.filter(
        (c) => c.Type === 'NodeLinkTitle',
      )
      const title =
        LinkTitle?.length === 1
          ? await callRenderHTML(LinkTitle[0], this)
          : ''
      if (LinkTitle && LinkTitle.length > 1)
        warn('NodeImage 存在多个 LinkTitle', sy)

      const style = sy.Properties?.style ?? ''
      /** 宽高属性：保证加载前占位，避免布局抖动 */
      const w = style.match(/(?:^|;)\s*width\s*:\s*(\d+(?:\.\d+)?)/)
      const h = style.match(/(?:^|;)\s*height\s*:\s*(\d+(?:\.\d+)?)/)
      return `<span ${await strAttr(sy)} style="${
        sy.Properties?.['parent-style'] ?? ''
      }">
  <img
    src="${link}"
    data-src="${link}"
    alt="${escapeAttr(title)}"
    title="${escapeAttr(title)}"
    ${w ? `width="${w[1]}"` : ''}
    ${h ? `height="${h[1]}"` : ''}
    style="${escapeAttr(style)}"
    loading="lazy"
    decoding="async"
  />
  <span class="img-title">${escapeText(title)}</span></span>`
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
    NodeKramdownBlockIAL: _emptyString,
    async NodeSuperBlock(sy) {
      return `<div ${strAttr(sy)} data-sb-layout="${childDateByType(
        sy,
        'NodeSuperBlockLayoutMarker',
      )}">${await callChildRender(sy, this)}</div>`
    },
    NodeSuperBlockOpenMarker: _emptyString,
    NodeSuperBlockCloseMarker: _emptyString,
    NodeSuperBlockLayoutMarker: _emptyString,
    /** 提示块（GFM Alert）：与自定义块共用 callout 样式，类型小写后作为 data-callout 驱动配色 */
    async NodeCallout(sy) {
      const type = (sy.CalloutType ?? 'note').toLowerCase()
      const icon = sy.CalloutIcon ?? ''
      return `<div ${strAttr(sy)} data-callout="${escapeAttr(type)}"><div class="op-callout__label">${escapeText(icon)}${escapeText(sy.CalloutTitle ?? type)}</div>${await callChildRender(sy, this)}</div>`
    },
    /** 页签容器：首个页签默认激活，切换由 main.js 处理；无脚本时全部平铺展示 */
    async NodeTabs(sy) {
      const active = sy.Properties?.['tabs-active-id']
      const position = sy.Properties?.['tabs-position'] === 'left' ? 'left' : 'top'
      const items = sy.Children?.filter((c) => c.Type === 'NodeTabItem') ?? []
      const activeId = items.some((c) => c.ID === active)
        ? active
        : items.find((c) => c.ID)?.ID
      const nav = (
        await Promise.all(
          items.map(async (item) => {
            const label = await renderInlineHtml(item.TabItemTitle ?? '', this)
            return `<button class="op-tabs__btn" type="button" role="tab" data-tab-id="${escapeAttr(
              item.ID ?? '',
            )}">${label}</button>`
          }),
        )
      ).join('')
      return `<div ${strAttr(
        sy,
      )} data-tabs-position="${position}" data-active-id="${escapeAttr(
        activeId ?? '',
      )}"><div class="op-tabs__nav" role="tablist">${nav}</div><div class="op-tabs__body">${await callChildRender(
        sy,
        this,
      )}</div></div>`
    },
    /** 页签项：标题是行内 HTML，走行内渲染保留样式；正文按普通块渲染 */
    async NodeTabItem(sy) {
      const titleHtml = await renderInlineHtml(sy.TabItemTitle ?? '', this)
      const titleText = unescaping((sy.TabItemTitle ?? '').replace(/<[^>]+>/g, ''))
      return `<section ${strAttr(sy)} role="tabpanel" aria-label="${escapeAttr(titleText)}"><div class="op-tab__label">${titleHtml}</div>${await callChildRender(sy, this)}</section>`
    },
    /** 嵌入块：label 右侧带定位链接，点击跳到所嵌入块在其源文档中的位置 */
    async NodeBlockQueryEmbed(sy) {
      const scripts = sy.Children?.filter((c) => c.Type === 'NodeBlockQueryEmbedScript') ?? []
      const targets: DB_block[] = []
      for (const script of scripts) {
        targets.push(...(await queryEmbedBlocks(script)))
      }
      const links = (
        await Promise.all(
          targets.map(async (block) => {
            const node = await storeDep.getNodeByID(block.id)
            const href =
              node && (await isCrossNotebook(block.id)) === false
                ? await resolveSiYuanLink(block.id, this)
                : ''
            if (node === undefined || href === '') return ''
            return `<a class="op-embed__locate" href="${escapeAttr(href)}" title="在源文档中查看：${escapeAttr(block.content)}" aria-label="在源文档中查看"><svg><use xlink:href="#iconLink"></use></svg></a>`
          }),
        )
      ).join('')
      return `<div ${strAttr(sy)}>\
  <div class="op-embed__label"><svg><use xlink:href="#iconSQL"></use></svg>嵌入块${links}</div>\
  <div class="op-embed__body">${await callChildRender(sy, this)}</div>\
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
        if (block.box !== notebookId) {
          htmlStr += crossRefPlaceholder('嵌入')
          continue
        }
        const node = await storeDep.getNodeByID(block.id)
        if (node === undefined) {
          htmlStr += warnDiv('未找到此块，可能为跨笔记引用', block.id)
          continue
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
      const [yes, mark] = isRenderCode(sy)
      if (yes) {
        return `<div ${strAttr(sy)} data-content="${escaping(
          sy.Children?.find((el) => el.Type === 'NodeCodeBlockCode')?.Data ??
            '',
        )}">
          <div spin="1"></div>
          <div class="protyle-attr" contenteditable="false"></div>
        </div>`
      }
      return `<div ${strAttr(sy)} data-language="${escapeAttr(mark)}">
          <div class="protyle-action">
            <span class="protyle-action--first protyle-action__language">${escapeText(
              mark,
            )}</span>
            <span class="fn__flex-1"></span><span class="protyle-icon protyle-icon--only protyle-action__copy" title="复制"><svg><use xlink:href="#iconCopy"></use></svg></span>
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
      /** 思源 TableAligns 枚举：0 左对齐、1 居中、2 右对齐、3 两端对齐 */
      const align = (n?: number) =>
        n === 1 ? 'center' : n === 2 ? 'right' : n === 3 ? 'justify' : 'left'
      return `<div ${strAttr(sy)}>
      <div>
        <table spellcheck="false">
          <colgroup>
          ${(sy.TableAligns ?? [])
            .map((a) => `<col style="text-align:${align(a)}" />`)
            .join('')}
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
      /** 思源 TableCellAlign 枚举：缺省/0 左对齐、1 居中、2 右对齐、3 两端对齐 */
      const align =
        sy.TableCellAlign === 1
          ? 'center'
          : sy.TableCellAlign === 2
          ? 'right'
          : sy.TableCellAlign === 3
          ? 'justify'
          : ''
      /** 单元格内的行级属性列表可能带 text-align（粘贴 Markdown 表格时常见），
       * 思源界面以它为准展示，这里与之保持一致并跳过该节点本身的输出 */
      const ialAlign = parseKramdownAlign(
        sy.Children?.find((el) => el.Type === 'NodeKramdownSpanIAL')?.Data,
      )
      const finalAlign = ialAlign ?? align
      return `<td${
        finalAlign ? ` style="text-align:${finalAlign}"` : ''
      }>${await callChildRender(sy, this)}</td>`
    },
    NodeHTMLBlock: async (sy) => `<div ${strAttr(sy)}>${sy.Data}</div>`,
    NodeThematicBreak: async (sy) => `<div ${strAttr(sy)}><div></div></div>`,
    NodeMathBlock: async (sy) =>
      `<div ${strAttr(
        sy,
      )} data-content="${childDateByType(sy, 'NodeMathBlockContent')}">
      <div spin="1"></div>
    </div>`,
    NodeMathBlockOpenMarker: _emptyString,
    NodeMathBlockContent: _emptyString,
    NodeMathBlockCloseMarker: _emptyString,
    async NodeIFrame(sy) {
      /** 思源把 iframe/video/audio 整体存为 html 字符串，其中 assets 引用需要改到顶层目录 */
      const prefix = await this.getTopPathPrefix()
      const media = (sy.Data ?? '').replace(
        /((?:src|data-src|dest5)=")assets\//g,
        `$1${prefix}/assets/`,
      )
      return `<div ${strAttr(sy)}>
      <div class="iframe-content">${media}</div>
    </div>`
    },
    NodeVideo: async function (this: Render, sy) { return this.NodeIFrame!.call(this, sy) },
    NodeAudio: async function (this: Render, sy) { return this.NodeIFrame!.call(this, sy) },
    /** 虚拟链接 */
    NodeHeadingC8hMarker: _emptyString,
    async NodeSoftBreak(_sy) {
      /** https://zh.wikipedia.org/wiki/零宽空格 */
      return '\u200B'
    },
    async NodeHardBreak(_sy) {
      return '<br>'
    },
    async NodeBr(sy) {
      return `<${sy.Data}>`
    },
    async NodeWidget(sy) {
      /** 思源端插件截的快照，仅带有该属性的挂件才有图；老挂件没有快照时降级为占位 */
      const hasSnapshot = sy.Properties?.['custom-oceanpress-widget-update']
      if (!hasSnapshot) {
        return `<div ${strAttr(sy)}><div class="op-widget-missing">挂件暂无快照，请在思源中打开该文档后重新构建</div></div>`
      }
      return `<div ${strAttr(
        sy,
      )}><img src="${await this.getTopPathPrefix()}/assets/widget/${
        sy.ID
      }.jpg" alt="挂件快照" loading="lazy"/></div>`
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
    NodeInlineHTML: _dataString,
    NodeHTMLEntity: _dataString,
    NodeEmoji: _dataString,
    NodeEmojiUnicode: _dataString,
    NodeEmojiImg: _dataString,
    NodeEmojiAlias: _dataString,
    NodeLinkRefDefBlock: _emptyString,
    NodeLinkRefDef: _emptyString,
    /** 脚注：定义块渲染为带编号的列表，引用渲染为上标 */
    async NodeFootnotesDefBlock(sy) {
      return `<div class="op-footnotes" data-type="NodeFootnotesDefBlock"><div class="op-footnotes__title">脚注</div>${await callChildRender(
        sy,
        this,
      )}</div>`
    },
    async NodeFootnotesDef(sy) {
      return `<div class="op-footnotes__item" id="${escapeAttr(
        sy.ID,
      )}">${await callChildRender(sy, this)}</div>`
    },
    NodeFootnotesRef: async (sy) =>
      `<sup class="op-footnote-ref" data-type="NodeFootnotesRef">${escapeText(
        sy.Data,
      )}</sup>`,
    /** 目录块：构建期只放占位，浏览器端由 main.js 根据标题生成 */
    async NodeToC(sy) {
      return `<div ${strAttr(
        sy,
      )} class="op-toc-inline" data-type="NodeToC"><div class="op-toc-inline__title">目录</div><nav class="op-toc-inline__body"></nav></div>`
    },
    /** YAML front matter 以元信息块形式展示 */
    async NodeYamlFrontMatter(sy) {
      return `<pre class="op-yaml" data-type="NodeYamlFrontMatter">${escapeText(
        childDateByType(sy, 'NodeYamlFrontMatterContent'),
      )}</pre>`
    },
    NodeYamlFrontMatterOpenMarker: _emptyString,
    NodeYamlFrontMatterContent: _emptyString,
    NodeYamlFrontMatterCloseMarker: _emptyString,
    /** 数据库（属性视图）：调用思源接口按当前视图渲染为表格 */
    async NodeAttributeView(sy) {
      const id = sy.AttributeViewID
      if (!id) return warnDiv('数据库块缺少 av id')
      const r = await API.av_renderAttributeView({ id })
      const { columns, rows } = r.view
      const head = columns
        .map((c) => `<th>${escapeText(c.name)}</th>`)
        .join('')
      const body = (
        await Promise.all(
          rows.map(async (row) => {
            const boundId = row.cells.find((cell) => cell.value?.block?.id)?.value
              ?.block?.id
            if (boundId && (await isCrossNotebook(boundId))) {
              const cells = row.cells
                .map(() => `<td class="op-av__masked">${crossRefPlaceholder('条目')}</td>`)
                .join('')
              return `<tr class="op-av__cross">${cells}</tr>`
            }
            return `<tr>${row.cells
              .map((cell) => `<td>${avCellValue(cell.value ?? {})}</td>`)
              .join('')}</tr>`
          }),
        )
      ).join('')
      return `<div ${strAttr(sy)} class="op-av" data-av-id="${escapeAttr(
        id,
      )}"><div class="op-av__title"><svg><use xlink:href="#iconDatabase"></use></svg>${escapeText(
        r.view.name || r.name,
      )}</div><div class="op-table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div></div>`
    },
    /** 自定义块（;;;info）：按 callout 语义渲染；expr 块在思源里无子内容，只有求值结果属性，直接渲染结果 */
    async NodeCustomBlock(sy) {
      /** CustomBlockInfo 是原始 JSON（如 {"info":"info"}），与 CodeBlockInfo 的 base64 不同 */
      const raw = sy.CustomBlockInfo ?? ''
      let info = ''
      try {
        info = String(JSON.parse(raw).info ?? '').trim().toLowerCase()
      } catch {
        info = raw.trim().toLowerCase()
      }
      if (info === 'expr') {
        const value = sy.Properties?.['custom-expr-value']
        return `<code ${strAttr(sy)} class="op-expr">${escapeText(value ?? '')}</code>`
      }
      return `<div ${strAttr(
        sy,
      )} class="op-callout" data-callout="${escapeAttr(
        info,
      )}"><div class="op-callout__label">${escapeText(
        info || 'note',
      )}</div>${await callChildRender(sy, this)}</div>`
    },

    async NodeGitConflict(sy) {
      return `<pre class="op-warn" data-type="NodeGitConflict">${escapeText(
        childDateByType(sy, 'NodeGitConflictContent'),
      )}</pre>`
    },
    NodeGitConflictOpenMarker: _emptyString,
    NodeGitConflictContent: _emptyString,
    NodeGitConflictCloseMarker: _emptyString,
  }

  return render
})

/** 数据库单元格值格式化：思源按列类型只填充其中一个字段 */
function avCellValue(v: {
  type?: string
  isNotEmpty?: boolean
  text?: { content?: string }
  number?: { content?: number }
  date?: { content?: number }
  select?: { content?: string }
  mSelect?: { content?: string }[]
  url?: { content?: string }
  block?: { content?: string; id?: string }
  email?: { content?: string }
  phone?: { content?: string }
  mAsset?: { content?: string; name?: string }[]
  checkbox?: { checked?: boolean }
}) {
  if (!v || v.isNotEmpty === false) return ''
  const t = v.text?.content
  if (t) return escapeText(t)
  if (v.number?.content !== undefined) return String(v.number.content)
  if (v.date?.content) {
    const d = new Date(v.date.content)
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  }
  if (v.select?.content) return escapeText(v.select.content)
  if (v.mSelect?.length)
    return v.mSelect
      .map((s) => `<span class="op-tag">${escapeText(s.content)}</span>`)
      .join('')
  if (v.url?.content)
    return `<a href="${escapeAttr(
      v.url.content,
    )}" target="_blank" rel="noopener">${escapeText(v.url.content)}</a>`
  if (v.block?.content) return escapeText(v.block.content)
  if (v.email?.content)
    return `<a href="mailto:${escapeAttr(
      v.email.content,
    )}">${escapeText(v.email.content)}</a>`
  if (v.phone?.content)
    return `<a href="tel:${escapeAttr(v.phone.content)}">${escapeText(
      v.phone.content,
    )}</a>`
  if (v.mAsset?.length)
    return v.mAsset
      .map((a) => `<span class="op-tag">${escapeText(a.name ?? a.content)}</span>`)
      .join('')
  if (v.checkbox) return v.checkbox.checked ? '☑' : '☐'
  return ''
}

/** 获取sy节点的child中第一个type类型节点的data */
function childDateByType(sy: S_Node, type: S_Node['Type']) {
  return sy.Children?.find((el) => el.Type === type)?.Data
}

function warn(...arg: any[]) {
  /** 构建期告警（循环引用、缺渲染器等）统一收集，由 build 阶段汇总输出，避免并发渲染时刷屏 */
  warnLog.push(arg.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' '))
}
/** 构建期告警缓冲 */
export const warnLog: string[] = []
