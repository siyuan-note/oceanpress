import { tempConfig, type SiteConfig } from './config.ts'
import { htmlTemplate } from './htmlTemplate.ts'
import { collectText, idToDate, type Render } from './render.ts'
import type { DocTree } from './build.ts'

/** 标签页所在目录（站点根下）。笔记自带的 tag 文档占用 /tag，这里用 /tags 避免冲突 */
export const tagsDir = '/tags'
/** 全部标签的索引页 */
export const tagsIndexPath = '/tags.html'

/** 标签名对应的文件名：斜杠会切分目录，替换成全角斜杠保证一个标签一个文件 */
export function tagPageFileName(tag: string) {
  return tag.replace(/[/\\]/g, '／')
}

/** HTML 属性值转义 */
function escapeAttr(s: string | undefined) {
  return (s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
/** HTML 文本转义 */
function escapeText(s: string | undefined) {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

type TaggedDoc = {
  /** 文档块 id，前 14 位是创建时间，用于排序 */
  id: string
  /** 文档 hpath，例如 /index/工具/tmux */
  path: string
  title: string
  date: string
  tags: string[]
}

/** 标签页里的单篇文章条目 */
function docItem(doc: TaggedDoc) {
  return `<a class="op-tagpage__item" href="${escapeAttr(encodeURI('..' + doc.path + '.html'))}">
    <span class="op-tagpage__item-title">${escapeText(doc.title)}</span>
    <span class="op-tagpage__item-meta"><time>${escapeText(doc.date)}</time>${
      doc.tags.length
        ? `<span class="op-tagpage__item-tags">${doc.tags
            .map((t) => `<span class="op-tag">#${escapeText(t)}</span>`)
            .join('')}</span>`
        : ''
    }</span>
  </a>`
}

/**
 * 为全部文档生成标签页（tags/<标签>.html）与标签索引页（tags.html）。
 * 标签页是纯静态产物：无需 JS 即可访问，可被搜索引擎收录，也可直接部署到任意静态托管
 */
export async function renderTagPages(
  docTree: DocTree,
  renderInstance: Render,
  site: SiteConfig | undefined,
): Promise<Record<string, string>> {
  /** 标签 → 带有该标签的文档 */
  const byTag = new Map<string, TaggedDoc[]>()
  for (const [path, { sy }] of Object.entries(docTree)) {
    const tags = [...collectText(sy, { text: '', tags: new Set() }).tags]
    const doc: TaggedDoc = {
      id: sy.ID ?? '',
      path,
      title: sy.Properties?.title || path,
      date: idToDate(sy.ID),
      tags,
    }
    for (const tag of tags) {
      const list = byTag.get(tag)
      if (list) list.push(doc)
      else byTag.set(tag, [doc])
    }
  }
  /** 新文章排前面：块 id 前 14 位是创建时间，字典序即时间序 */
  const newestFirst = (a: TaggedDoc, b: TaggedDoc) => b.id.localeCompare(a.id)
  const sortedTags = [...byTag.keys()].sort((a, b) => a.localeCompare(b))

  /** 标签页在站点根下一层，指向站点根的链接统一 ../ */
  const page = (level: 0 | 1, title: string, inner: string) =>
    htmlTemplate(
      {
        title,
        htmlContent: renderInstance.pageShell(
          level === 0 ? '.' : '..',
          `<article class="op-doc op-tagpage">
  <header class="op-doc-header">
    <h1 class="h1 op-doc-header__title" data-type="NodeHeading">${escapeText(title)}</h1>
    <nav class="op-breadcrumb" aria-label="面包屑"><a class="op-breadcrumb__item" href="../">首页</a><span class="op-breadcrumb__sep">/</span><a class="op-breadcrumb__item" href="../${tagsIndexPath.slice(1)}">标签</a></nav>
  </header>
  <div class="op-doc-body">${inner}</div>
</article>`,
          '',
        ),
        level,
      },
      { ...tempConfig.cdn, site },
    )

  const fileTree: Record<string, string> = {}
  for (const tag of sortedTags) {
    const list = byTag.get(tag)!.sort(newestFirst)
    fileTree[`${tagsDir}/${tagPageFileName(tag)}.html`] = await page(
      1,
      `# ${tag}`,
      `<div class="op-tagpage__count">共 ${list.length} 篇</div>
<div class="op-tagpage__list">${list.map(docItem).join('')}</div>`,
    )
  }
  fileTree[tagsIndexPath] = await page(
    0,
    '标签',
    `<div class="op-tagpage__count">共 ${sortedTags.length} 个标签</div>
<div class="op-tagpage__cloud">${sortedTags
      .map((tag) => {
        const n = byTag.get(tag)!.length
        return `<a class="op-tag" href="${tagsDir.slice(1)}/${encodeURI(tagPageFileName(tag))}.html">#${escapeText(tag)}<span class="op-tagpage__n">${n}</span></a>`
      })
      .join('')}</div>`,
  )
  return fileTree
}
