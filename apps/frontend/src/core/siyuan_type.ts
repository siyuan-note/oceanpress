export interface notebook {
  id: "20210808180117-czj9bvb";
  name: "思源笔记用户指南";
  icon: "1f4d4";
  sort: 1;
  closed: false;
}
export interface file {
  /** "/20210816161946-cktc4gf.sy" */
  path: string;
  name: "关于.sy";
  icon: "";
  name1: "";
  alias: "";
  memo: "";
  bookmark: "";
  /** "20210816161946-cktc4gf" */
  id: string;
  count: 0;
  size: 362;
  hSize: "362 B";
  mtime: 1629101986;
  ctime: 1629101986;
  hMtime: "2 年以前";
  hCtime: "2021-08-16 16:19:46";
  sort: 0;
  subFileCount: 9;
  newFlashcardCount: 0;
  dueFlashcardCount: 0;
  flashcardCount: 0;
}
export interface NodeDocument {
  blockCount: 2;
  box: "20210808180117-czj9bvb";
  content: "<html>";
  eof: false;
  id: "20230519105228-hm0y74i";
  isBacklinkExpand: false;
  isSyncing: false;
  mode: 0;
  parent2ID: "20230519105228-hm0y74i";
  parentID: "20230519105228-hm0y74i";
  path: "/20230519105228-hm0y74i.sy";
  rootID: "20230519105228-hm0y74i";
  scroll: false;
  type: "NodeDocument";
}

export function DB_block_path(p: DB_block) {
  return `data/${p.box}${p.path}`;
}
export interface DB_block {
  alias: "";
  box: "20210816161940-3mfvumm";
  content: "自述";
  created: "20201125202944";
  fcontent: "自述";
  hash: "922ee83";
  hpath: "/计算机基础课/自述";
  ial: '{: id="20201125202944-01mdxqn" title="自述" type="doc" updated="20201125202944"}';
  id: "20201125202944-01mdxqn";
  length: 2;
  markdown: "";
  memo: "";
  name: "";
  parent_id: "";
  path: "/20210816161944-io0cgn6/20201125202944-01mdxqn.sy";
  root_id: "20201125202944-01mdxqn";
  sort: 0;
  subtype: "";
  tag: "";
  type: "d";
  updated: "20201125202944";
}
export interface S_Node {
  ID?: string; // 节点的唯一标识
  Box?: string; // 容器
  Path?: string; // 路径
  Spec?: string; // 规范版本号
  Type: NodeType; // 节点类型
  Parent: S_Node; // 父节点 在 node.ts 中被重建了，所以这个引用关系是可用的
  Previous?: S_Node; // 前一个兄弟节点
  Next?: S_Node; // 后一个兄弟节点
  FirstChild?: S_Node; // 第一个子节点
  LastChild?: S_Node; // 最后一个子节点
  Children?: S_Node[]; // 所有子节点
  Tokens?: number[]; // 词法分析结果 Tokens，语法分析阶段会继续操作这些 Tokens
  TypeStr: string; // 类型字符串
  Data?: string; // Tokens 字符串
  Close?: boolean; // 标识是否关闭
  LastLineBlank?: boolean; // 标识最后一行是否是空行
  LastLineChecked?: boolean; // 标识最后一行是否检查过
  CodeMarkerLen?: number; // ` 个数，1 或 2
  IsFencedCodeBlock?: boolean;
  CodeBlockFenceChar?: number;
  CodeBlockFenceLen?: number;
  CodeBlockFenceOffset?: number;
  CodeBlockOpenFence?: number[];
  CodeBlockInfo?: string; // Z28= | atob = 'go'
  CodeBlockCloseFence?: number[];
  HtmlBlockType?: number;
  ListData?: ListData;
  TaskListItemChecked?: boolean;
  TableAligns?: number[];
  TableCellAlign?: number;
  TableCellContentWidth?: number;
  TableCellContentMaxWidth?: number;
  LinkType?: number;
  LinkRefLabel?: number[];
  HeadingLevel?: number;
  HeadingSetext?: boolean;
  HeadingNormalizedID?: string;
  MathBlockDollarOffset?: number;
  FootnotesRefLabel?: number[];
  FootnotesRefId?: string;
  FootnotesRefs?: Node[];
  HtmlEntityTokens?: number[];
  KramdownIAL?: string[][];
  Properties?: {
    icon: "1f4f0";
    id: "20200825162036-4dx365o";
    title: "排版元素";
    "title-img": "background-color: hsl(2, 57%, 40%);background-image: repeating-linear-gradient(transparent, transparent 50px, rgba(0,0,0,.4) 50px, rgba(0,0,0,.4) 53px, transparent 53px, transparent 63px, rgba(0,0,0,.4) 63px, rgba(0,0,0,.4) 66px, transparent 66px, transparent 116px, rgba(0,0,0,.5) 116px, rgba(0,0,0,.5) 166px, rgba(255,255,255,.2) 166px, rgba(255,255,255,.2) 169px, rgba(0,0,0,.5) 169px, rgba(0,0,0,.5) 179px, rgba(255,255,255,.2) 179px, rgba(255,255,255,.2) 182px, rgba(0,0,0,.5) 182px, rgba(0,0,0,.5) 232px, transparent 232px),repeating-linear-gradient(270deg, transparent, transparent 50px, rgba(0,0,0,.4) 50px, rgba(0,0,0,.4) 53px, transparent 53px, transparent 63px, rgba(0,0,0,.4) 63px, rgba(0,0,0,.4) 66px, transparent 66px, transparent 116px, rgba(0,0,0,.5) 116px, rgba(0,0,0,.5) 166px, rgba(255,255,255,.2) 166px, rgba(255,255,255,.2) 169px, rgba(0,0,0,.5) 169px, rgba(0,0,0,.5) 179px, rgba(255,255,255,.2) 179px, rgba(255,255,255,.2) 182px, rgba(0,0,0,.5) 182px, rgba(0,0,0,.5) 232px, transparent 232px),repeating-linear-gradient(125deg, transparent, transparent 2px, rgba(0,0,0,.2) 2px, rgba(0,0,0,.2) 3px, transparent 3px, transparent 5px, rgba(0,0,0,.2) 5px);";
    type: "doc";
    updated: "20230820185054";
    "parent-style"?: "max-width: 137px;";
    style?: "display: block;";
  };
  TextMarkType?: "block-ref" | "a" | "tag" | "inline-math" | "inline-memo";
  TextMarkAHref?: string;
  TextMarkATitle?: string;
  TextMarkInlineMathContent?: string;
  TextMarkInlineMemoContent?: string;
  TextMarkBlockRefID?: string;
  TextMarkBlockRefSubtype?: string;
  TextMarkFileAnnotationRefID?: string;
  TextMarkTextContent?: string;
  AttributeViewID?: string;
  AttributeViewType?: string;
  CustomBlockFenceOffset?: number;
  CustomBlockInfo?: string;
}
type NodeType = ValueKeys<typeof NodeType>;
type ValueKeys<T> = keyof { [K in keyof T]: T[K] extends string ? K : never };
interface ListData {
  Typ?: number; // 0：无序列表，1：有序列表，3：任务列表
  Tight?: boolean; // 是否是紧凑模式
  BulletChar?: number; // 无序列表标识，* - 或者 +
  Start?: number; // 有序列表起始序号
  Delimiter?: number; // 有序列表分隔符，. 或者 )
  Padding?: number; // 列表内部缩进空格数（包含标识符长度，即规范中的 W+N）
  MarkerOffset?: number; // 标识符（* - + 或者 1 2 3）相对缩进空格数
  Checked?: boolean; // 任务列表项是否勾选
  Marker?: string; // 列表标识符
  Num?: number; // 有序列表项修正过的序号
}

export const NodeType = {
  NodeDocument: 0, // 根
  NodeParagraph: 1, // 段落
  NodeHeading: 2, // 标题
  NodeHeadingC8hMarker: 3, // ATX 标题标记符 #
  NodeThematicBreak: 4, // 分隔线
  NodeBlockquote: 5, // 块引用
  NodeBlockquoteMarker: 6, // 块引用标记符 >
  NodeList: 7, // 列表
  NodeListItem: 8, // 列表项
  NodeHTMLBlock: 9, // HTML 块
  NodeInlineHTML: 10, // 内联 HTML
  NodeCodeBlock: 11, // 代码块
  NodeCodeBlockFenceOpenMarker: 12, // 开始围栏代码块标记符 ```
  NodeCodeBlockFenceCloseMarker: 13, // 结束围栏代码块标记符 ```
  NodeCodeBlockFenceInfoMarker: 14, // 围栏代码块信息标记符 info string
  NodeCodeBlockCode: 15, // 围栏代码块代码
  NodeText: 16, // 文本
  NodeEmphasis: 17, // 强调
  NodeEmA6kOpenMarker: 18, // 开始强调标记符 *
  NodeEmA6kCloseMarker: 19, // 结束强调标记符 *
  NodeEmU8eOpenMarker: 20, // 开始强调标记符 _
  NodeEmU8eCloseMarker: 21, // 结束强调标记符 _
  NodeStrong: 22, // 加粗
  NodeStrongA6kOpenMarker: 23, // 开始加粗标记符 **
  NodeStrongA6kCloseMarker: 24, // 结束加粗标记符 **
  NodeStrongU8eOpenMarker: 25, // 开始加粗标记符 __
  NodeStrongU8eCloseMarker: 26, // 结束加粗标记符 __
  NodeCodeSpan: 27, // 代码
  NodeCodeSpanOpenMarker: 28, // 开始代码标记符 `
  NodeCodeSpanContent: 29, // 代码内容
  NodeCodeSpanCloseMarker: 30, // 结束代码标记符 `
  NodeHardBreak: 31, // 硬换行
  NodeSoftBreak: 32, // 软换行
  NodeLink: 33, // 链接
  NodeImage: 34, // 图片
  NodeBang: 35, // !
  NodeOpenBracket: 36, // [
  NodeCloseBracket: 37, // ]
  NodeOpenParen: 38, // (
  NodeCloseParen: 39, // )
  NodeLinkText: 40, // 链接文本
  NodeLinkDest: 41, // 链接地址
  NodeLinkTitle: 42, // 链接标题
  NodeLinkSpace: 43, // 链接地址和链接标题之间的空格
  NodeHTMLEntity: 44, // HTML 实体
  NodeLinkRefDefBlock: 45, // 链接引用定义块
  NodeLinkRefDef: 46, // 链接引用定义 [label]:
  NodeLess: 47, // <
  NodeGreater: 48, // >

  // GFM

  NodeTaskListItemMarker: 100, // 任务列表项标记符
  NodeStrikethrough: 101, // 删除线
  NodeStrikethrough1OpenMarker: 102, // 开始删除线标记符 ~
  NodeStrikethrough1CloseMarker: 103, // 结束删除线标记符 ~
  NodeStrikethrough2OpenMarker: 104, // 开始删除线标记符 ~~
  NodeStrikethrough2CloseMarker: 105, // 结束删除线标记符 ~~
  NodeTable: 106, // 表
  NodeTableHead: 107, // 表头
  NodeTableRow: 108, // 表行
  NodeTableCell: 109, // 表格

  // Emoji

  NodeEmoji: 200, // Emoji
  NodeEmojiUnicode: 201, // Emoji Unicode
  NodeEmojiImg: 202, // Emoji 图片
  NodeEmojiAlias: 203, // Emoji ASCII

  // 数学公式

  NodeMathBlock: 300, // 数学公式块
  NodeMathBlockOpenMarker: 301, // 开始数学公式块标记符 $$
  NodeMathBlockContent: 302, // 数学公式块内容
  NodeMathBlockCloseMarker: 303, // 结束数学公式块标记符 $$
  NodeInlineMath: 304, // 内联数学公式
  NodeInlineMathOpenMarker: 305, // 开始内联数学公式标记符 $
  NodeInlineMathContent: 306, // 内联数学公式内容
  NodeInlineMathCloseMarker: 307, // 结束内联数学公式标记符 $

  // 转义

  NodeBackslash: 400, // 转义反斜杠标记符 \
  NodeBackslashContent: 401, // 转义反斜杠后的内容

  // Vditor 支持

  NodeVditorCaret: 405, // 插入符，某些情况下需要使用该节点进行插入符位置调整

  // 脚注

  NodeFootnotesDefBlock: 410, // 脚注定义块
  NodeFootnotesDef: 411, // 脚注定义 [^label]:
  NodeFootnotesRef: 412, // 脚注引用 [^label]

  // 目录

  NodeToC: 415, // 目录 [toc]

  // 标题

  NodeHeadingID: 420, // 标题 ID # foo {id}

  // YAML Front Matter

  NodeYamlFrontMatter: 425, // https://,jekyllrb.com/docs/front-matter/
  NodeYamlFrontMatterOpenMarker: 426, // 开始 YAML Front Matter 标记符 ---
  NodeYamlFrontMatterContent: 427, // YAML Front Matter 内容
  NodeYamlFrontMatterCloseMarker: 428, // 结束 YAML Front Matter 标记符 ---

  // 内容块引用（Block Reference） https://,github.com/88250/lute/issues/82

  NodeBlockRef: 430, // 内容块引用节点
  NodeBlockRefID: 431, // 被引用的内容块（定义块）ID
  NodeBlockRefSpace: 432, // 被引用的内容块 ID 和内容块引用锚文本之间的空格
  NodeBlockRefText: 433, // 内容块引用锚文本
  NodeBlockRefDynamicText: 434, // 内容块引用动态锚文本

  // ==Mark== 标记语法 https://,github.com/88250/lute/issues/84

  NodeMark: 450, // 标记
  NodeMark1OpenMarker: 451, // 开始标记标记符 =
  NodeMark1CloseMarker: 452, // 结束标记标记符 =
  NodeMark2OpenMarker: 453, // 开始标记标记符 ==
  NodeMark2CloseMarker: 454, // 结束标记标记符 ==

  // kramdown 内联属性列表 https://,github.com/88250/lute/issues/89 and https://,github.com/88250/lute/issues/118

  NodeKramdownBlockIAL: 455, // 块级内联属性列表 {: name,="value"}
  NodeKramdownSpanIAL: 456, // 行级内联属性列表 *foo*{: name,="value"}bar

  // #Tag# 标签语法 https://,github.com/88250/lute/issues/92

  NodeTag: 460, // 标签
  NodeTagOpenMarker: 461, // 开始标签标记符 #
  NodeTagCloseMarker: 462, // 结束标签标记符 #

  // 内容块查询嵌入（Block Query Embed）语法 https://,github.com/88250/lute/issues/96

  NodeBlockQueryEmbed: 465, // 内容块查询嵌入
  NodeOpenBrace: 466, // {
  NodeCloseBrace: 467, // }
  NodeBlockQueryEmbedScript: 468, // 内容块查询嵌入脚本

  // 超级块语法 https://,github.com/88250/lute/issues/111

  NodeSuperBlock: 475, // 超级块节点
  NodeSuperBlockOpenMarker: 476, // 开始超级块标记符 {{{
  NodeSuperBlockLayoutMarker: 477, // 超级块布局 row/col
  NodeSuperBlockCloseMarker: 478, // 结束超级块标记符 }}}

  // 上标下标语法 https://,github.com/88250/lute/issues/113

  NodeSup: 485, // 上标
  NodeSupOpenMarker: 486, // 开始上标标记符 ^
  NodeSupCloseMarker: 487, // 结束上标标记符 ^
  NodeSub: 490, // 下标
  NodeSubOpenMarker: 491, // 开始下标标记符 ~
  NodeSubCloseMarker: 492, // 结束下标标记符 ~

  // Git 冲突标记 https://,github.com/88250/lute/issues/131

  NodeGitConflict: 495, // Git 冲突标记
  NodeGitConflictOpenMarker: 496, // 开始 Git 冲突标记标记符 <<<<<<<
  NodeGitConflictContent: 497, // Git 冲突标记内容
  NodeGitConflictCloseMarker: 498, // 结束 Git 冲突标记标记符 >>>>>>>

  // <iframe> 标签

  NodeIFrame: 500, // <iframe> 标签

  // <audio> 标签

  NodeAudio: 505, // <audio> 标签

  // <video> 标签

  NodeVideo: 510, // <video> 标签

  // <kbd> 标签

  NodeKbd: 515, // 键盘
  NodeKbdOpenMarker: 516, // 开始 kbd 标记符 <kbd>
  NodeKbdCloseMarker: 517, // 结束 kbd 标记符 </kbd>

  // <u> 标签

  NodeUnderline: 520, // 下划线
  NodeUnderlineOpenMarker: 521, // 开始下划线标记符 <u>
  NodeUnderlineCloseMarker: 522, // 结束下划线标记符 </u>

  // <br> 标签

  NodeBr: 525, // <br> 换行

  // <span data-type="mark">foo</span> 通用的行级文本标记，不能嵌套

  NodeTextMark: 530, // 文本标记，该节点因为不存在嵌套，所以不使用 Open/Close 标记符

  // Protyle 挂件，<iframe data-type="NodeWidget">

  NodeWidget: 535, // <iframe data-type="NodeWidget" data-subtype="widget"></iframe>

  // 文件注解引用 https://,github.com/88250/lute/issues/155

  NodeFileAnnotationRef: 540, // 文件注解引用节点
  NodeFileAnnotationRefID: 541, // 被引用的文件注解 ID（file/annotation）
  NodeFileAnnotationRefSpace: 542, // 被引用的文件注解 ID 和文件注解引用锚文本之间的空格
  NodeFileAnnotationRefText: 543, // 文件注解引用锚文本（不能为空，如果为空的话会自动使用 ID 渲染）

  // 属性视图 https://,github.com/siyuan-note/siyuan/issues/7535 <div data-type="NodeAttributeView" data-av-type="table" data-av-id="xxx"></div>

  NodeAttributeView: 550, // 属性视图

  // 自定义块 https://,github.com/siyuan-note/siyuan/issues/8418 ;;;info

  NodeCustomBlock: 560, // 自定义块

  NodeTypeMaxVal: 1024, // 节点类型最大值
};
