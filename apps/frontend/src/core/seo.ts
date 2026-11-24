/** SEO 优化和结构化数据生成：为生成的 HTML 页面输出 meta 标签与 JSON-LD */
import type { Config } from './config.ts'
import type { S_Node } from './siyuan_type.ts'

/** 用于关键词提取的停用词（中英文高频虚词/代词） */
const stopWords = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '现在', '可以', '但是', '还是', '因为', '什么', '如果', '所以', '我们', '他们', '使用', '可以', '一个',
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'com', 'www', 'http', 'https',
])

/** 思源时间串（20250801084546）转 ISO 8601；无法解析时回退为当前时间 */
function syDateToISO(date?: string) {
  if (date && /^\d{14}$/.test(date)) {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(8, 10)}:${date.slice(10, 12)}:${date.slice(12, 14)}Z`
  }
  return new Date().toISOString()
}

/** 属性值转义 */
function attr(s: string) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/** 去掉 html 标签与实体，得到用于摘要的纯文本 */
function toPlainText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 截取描述：优先在句子边界截断 */
function extractDescription(plainText: string, maxLength = 160) {
  if (plainText.length <= maxLength) return plainText
  const truncated = plainText.substring(0, maxLength)
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('！'),
    truncated.lastIndexOf('？'),
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?'),
  )
  return lastSentenceEnd > maxLength * 0.7
    ? truncated.substring(0, lastSentenceEnd + 1)
    : truncated + '...'
}

/** 关键词：英文词（≥3 字母）与中文 2~4 字片段按词频取前 N 个 */
function extractKeywords(plainText: string, max = 8) {
  const count = new Map<string, number>()
  const push = (w: string) => {
    if (!stopWords.has(w)) count.set(w, (count.get(w) ?? 0) + 1)
  }
  for (const w of plainText.match(/[a-zA-Z][a-zA-Z0-9_-]{2,}/g) ?? [])
    push(w.toLowerCase())
  for (const w of plainText.match(/[\u4e00-\u9fa5]{2,4}/g) ?? []) push(w)
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w)
}

/** 从题头图样式中提取背景图片路径（思源存在 title-img 里） */
function coverAssetUrl(doc: S_Node) {
  const m = doc.Properties?.['title-img']?.match(/url\(["']?(assets\/[^)"']+)/)
  return m?.[1]
}

/** JSON-LD 输出 */
function jsonLd(data: object) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
}

export interface SeoData {
  doc: S_Node
  config: Config
  pageUrl: string
  content: string
  breadcrumbs?: Array<{ name: string; url: string }>
}

/** 生成完整的 SEO 代码：meta 标签 + JSON-LD */
export function generateSeoContent(data: SeoData): { metaTags: string; jsonLd: string } {
  const { doc, config, pageUrl, content, breadcrumbs } = data
  const site = config.site
  const siteTitle = site.title || config.notebook.name || 'OceanPress'
  const author = site.author || siteTitle
  const title = doc.Properties?.title || '未命名文档'
  const description = site.description && pageUrl.endsWith('/index.html') ? site.description : extractDescription(toPlainText(content))
  const keywords = extractKeywords(toPlainText(content))
  const datePublished = syDateToISO(doc.ID)
  const dateModified = syDateToISO(doc.Properties?.updated)
  const image = coverAssetUrl(doc)
  const imageUrl = image && config.sitemap.siteLink ? `${config.sitemap.siteLink}/${image}` : ''

  const meta: string[] = [
    `<meta name="description" content="${attr(description)}" />`,
    keywords.length ? `<meta name="keywords" content="${attr(keywords.join(', '))}" />` : '',
    `<meta name="author" content="${attr(author)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="${attr(siteTitle)}" />`,
    `<meta property="og:title" content="${attr(title)}" />`,
    `<meta property="og:description" content="${attr(description)}" />`,
    `<meta property="og:url" content="${attr(pageUrl)}" />`,
    `<meta property="og:locale" content="zh_CN" />`,
    imageUrl ? `<meta property="og:image" content="${attr(imageUrl)}" />` : '',
    `<meta name="twitter:card" content="${imageUrl ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${attr(title)}" />`,
    `<meta name="twitter:description" content="${attr(description)}" />`,
    imageUrl ? `<meta name="twitter:image" content="${attr(imageUrl)}" />` : '',
    `<meta property="article:published_time" content="${datePublished}" />`,
    `<meta property="article:modified_time" content="${dateModified}" />`,
    `<meta property="article:author" content="${attr(author)}" />`,
    `<meta name="robots" content="index, follow" />`,
    config.sitemap.siteLink ? `<link rel="canonical" href="${attr(pageUrl)}" />` : '',
  ]

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    keywords: keywords.join(', '),
    datePublished,
    dateModified,
    author: { '@type': 'Person', name: author, url: config.sitemap.siteLink || undefined },
    publisher: { '@type': 'Organization', name: siteTitle },
    mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
    image: imageUrl || undefined,
    wordCount: toPlainText(content).length,
    inLanguage: 'zh-CN',
  }
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteTitle,
    description: site.description || undefined,
    url: config.sitemap.siteLink || undefined,
    author: { '@type': 'Person', name: author },
    inLanguage: 'zh-CN',
  }
  const breadcrumbList = breadcrumbs?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
      }
    : undefined

  return {
    metaTags: meta.filter(Boolean).join('\n  '),
    jsonLd: [article, ...(pageUrl.endsWith('/index.html') ? [website] : []), ...(breadcrumbList ? [breadcrumbList] : [])].map(jsonLd).join('\n  '),
  }
}
