/**
 * SEO 优化和结构化数据生成工具
 * 为 OceanPress 生成的 HTML 页面添加 JSON-LD 结构化数据和其他 SEO 优化
 */

import { Config } from './config.ts'
import { S_Node } from './siyuan_type.ts'

// 简化的停用词集合（减少内存占用）
const simplifiedStopWords = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '现在', '可以', '但是', '还是', '因为', '什么', '如果', '所以',
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
])

// HTML标签清理缓存（针对相同内容的重复处理）
const htmlCleanupCache = new Map<string, string>()

// 限制缓存大小
const MAX_CACHE_SIZE = 500
function manageCacheSize(): void {
  if (htmlCleanupCache.size > MAX_CACHE_SIZE) {
    const firstKey = htmlCleanupCache.keys().next().value
    if (firstKey) {
      htmlCleanupCache.delete(firstKey)
    }
  }
}


/**
 * 从思源文档ID中提取日期时间并格式化为 ISO 8601
 * 思源ID格式: 20250801084546-uvfteud -> 2025-08-01T08:45:46Z
 */
function extractDateFromId(id?: string): string {
  if (!id || id.length < 14) return new Date().toISOString()

  try {
    const datePart = id.slice(0, 14) // 取前14位: 20250801084546
    if (datePart.length === 14) {
      const year = datePart.slice(0, 4)
      const month = datePart.slice(4, 6)
      const day = datePart.slice(6, 8)
      const hour = datePart.slice(8, 10)
      const minute = datePart.slice(10, 12)
      const second = datePart.slice(12, 14)
      return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
    }
  } catch {
    // 忽略解析错误，使用默认值
  }
  return new Date().toISOString()
}

/**
 * 格式化日期为 ISO 8601 格式
 */
function formatDate(dateString?: string): string {
  if (!dateString) return new Date().toISOString()
  try {
    // 思源笔记的日期格式通常是 YYYYMMDDHHMMSS 或时间戳
    if (dateString.length === 14) {
      // YYYYMMDDHHMMSS 格式
      const year = dateString.slice(0, 4)
      const month = dateString.slice(4, 6)
      const day = dateString.slice(6, 8)
      const hour = dateString.slice(8, 10)
      const minute = dateString.slice(10, 12)
      const second = dateString.slice(12, 14)
      return `${year}-${month}-${day}T${hour}:${minute}:${second}Z`
    }
    // 尝试解析为时间戳
    const timestamp = parseInt(dateString)
    if (!isNaN(timestamp)) {
      return new Date(timestamp).toISOString()
    }
    // 尝试直接解析
    return new Date(dateString).toISOString()
  } catch {
    return new Date().toISOString()
  }
}

/**
 * 优化的HTML清理函数（带缓存）
 */
function cleanHtmlContent(content: string): string {
  const cacheKey = content
  if (htmlCleanupCache.has(cacheKey)) {
    return htmlCleanupCache.get(cacheKey)!
  }
  
  const cleaned = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  htmlCleanupCache.set(cacheKey, cleaned)
  manageCacheSize()
  return cleaned
}

/**
 * 从文档内容中提取描述文本（带缓存）
 */
function extractDescription(content: string, maxLength = 160): string {
  const plainText = cleanHtmlContent(content)

  if (plainText.length <= maxLength) {
    return plainText
  }

  // 尝试在句子边界截断
  const truncated = plainText.substring(0, maxLength)
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('！'),
    truncated.lastIndexOf('？'),
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  )

  return lastSentenceEnd > maxLength * 0.7 
    ? truncated.substring(0, lastSentenceEnd + 1)
    : truncated + '...'
}

/**
 * 优化的关键词提取（带缓存和简化算法）
 */
function extractKeywords(content: string): string[] {
  const plainText = cleanHtmlContent(content)
  return simplifiedKeywordExtraction(plainText, 8)
}

/**
 * 简化的关键词提取算法（性能优化）
 */
function simplifiedKeywordExtraction(text: string, maxKeywords: number = 8): string[] {
  const words: string[] = []
  const wordCount = new Map<string, number>()
  
  // 快速提取英文单词和技术术语
  const englishWords = text.match(/[a-zA-Z]{3,}/g) || []
  for (const word of englishWords) {
    const lowerWord = word.toLowerCase()
    if (!simplifiedStopWords.has(lowerWord) && lowerWord.length >= 3) {
      words.push(lowerWord)
      wordCount.set(lowerWord, (wordCount.get(lowerWord) || 0) + 1)
    }
  }
  
  // 快速提取中文词汇（2-4字）
  const chineseWords = text.match(/[\u4e00-\u9fa5]{2,4}/g) || []
  for (const word of chineseWords) {
    if (!simplifiedStopWords.has(word)) {
      words.push(word)
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    }
  }
  
  // 基于词频排序，返回前N个关键词
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word)
}

/**
 * 生成文章的 JSON-LD 结构化数据
 */
export function generateArticleJsonLd(
  doc: S_Node,
  config: Config,
  pageUrl: string,
  content: string
): string {
  const title = doc.Properties?.title || '未命名文档'
  const description = extractDescription(content)
  const keywords = extractKeywords(content)
  // 从ID中提取创建时间，如果没有则使用updated时间
  const datePublished = extractDateFromId(doc.ID)
  const dateModified = formatDate(doc.Properties?.updated)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    keywords: keywords.join(', '),
    datePublished: datePublished,
    dateModified: dateModified,
    author: {
      '@type': 'Person',
      name: config.sitemap?.title || '崮生',
      url: config.sitemap?.siteLink || ''
    },
    publisher: {
      '@type': 'Organization',
      name: config.sitemap?.title || 'OceanPress',
      logo: {
        '@type': 'ImageObject',
        url: `${config.sitemap?.siteLink || ''}/assets/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    image: doc.Properties?.['title-img'] ? {
      '@type': 'ImageObject',
      url: `${config.sitemap?.siteLink || ''}${doc.Properties['title-img'].replace('assets', '/assets')}`,
      width: 1200,
      height: 630
    } : undefined,
    wordCount: content.replace(/<[^>]*>/g, '').length,
    articleSection: '技术文档',
    inLanguage: 'zh-CN'
  }

  return `<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>`
}

/**
 * 生成面包屑导航的 JSON-LD
 */
export function generateBreadcrumbJsonLd(
  breadcrumbs: Array<{ name: string; url: string }>
): string {
  const itemListElement = breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: crumb.url
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itemListElement
  }

  return `<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>`
}

/**
 * 生成网站的 JSON-LD
 */
export function generateWebsiteJsonLd(config: Config): string {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.sitemap?.title || 'OceanPress 站点',
    description: config.sitemap?.description || '基于思源笔记的静态站点',
    url: config.sitemap?.siteLink || '',
    author: {
      '@type': 'Person',
      name: '崮生'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.sitemap?.siteLink || ''}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    inLanguage: 'zh-CN'
  }

  return `<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>`
}

/**
 * 生成完整的 SEO meta 标签
 */
export function generateSeoMetaTags(
  doc: S_Node,
  config: Config,
  pageUrl: string,
  content: string
): string {
  const title = doc.Properties?.title || '未命名文档'
  const description = extractDescription(content)
  const keywords = extractKeywords(content)

  let metaTags = ''

  // 基础 meta 标签
  metaTags += `  <meta name="description" content="${description.replace(/"/g, '&quot;')}" />\n`
  metaTags += `  <meta name="keywords" content="${keywords.join(', ')}" />\n`
  metaTags += `  <meta name="author" content="${config.sitemap?.title || '崮生'}" />\n`

  // Open Graph 标签
  metaTags += `  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />\n`
  metaTags += `  <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />\n`
  metaTags += `  <meta property="og:type" content="article" />\n`
  metaTags += `  <meta property="og:url" content="${pageUrl}" />\n`
  metaTags += `  <meta property="og:site_name" content="${config.sitemap?.title || 'OceanPress'}" />\n`

  if (doc.Properties?.['title-img']) {
    const imageUrl = `${config.sitemap?.siteLink || ''}${doc.Properties['title-img'].replace('assets', '/assets')}`
    metaTags += `  <meta property="og:image" content="${imageUrl}" />\n`
    metaTags += `  <meta property="og:image:width" content="1200" />\n`
    metaTags += `  <meta property="og:image:height" content="630" />\n`
  }

  // 从ID中提取创建时间
  const datePublished = extractDateFromId(doc.ID)
  const dateModified = formatDate(doc.Properties?.updated)

  metaTags += `  <meta property="article:published_time" content="${datePublished}" />\n`
  metaTags += `  <meta property="article:modified_time" content="${dateModified}" />\n`

  // Twitter Card 标签
  metaTags += `  <meta name="twitter:card" content="summary_large_image" />\n`
  metaTags += `  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />\n`
  metaTags += `  <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />\n`

  if (doc.Properties?.['title-img']) {
    const imageUrl = `${config.sitemap?.siteLink || ''}${doc.Properties['title-img'].replace('assets', '/assets')}`
    metaTags += `  <meta name="twitter:image" content="${imageUrl}" />\n`
  }

  // 其他 SEO 标签
  metaTags += `  <meta name="robots" content="index, follow" />\n`
  metaTags += `  <link rel="canonical" href="${pageUrl}" />\n`

  return metaTags
}

/**
 * SEO 数据接口
 */
export interface SeoData {
  doc: S_Node
  config: Config
  pageUrl: string
  content: string
  breadcrumbs?: Array<{ name: string; url: string }>
}

/**
 * 生成完整的 SEO 优化代码（性能优化版本）
 */
export function generateSeoContent(data: SeoData): {
  metaTags: string
  jsonLd: string
} {
  // 只对内容处理进行缓存，不缓存整个SEO结果
  const plainText = cleanHtmlContent(data.content)
  const description = extractDescriptionFromPlainText(plainText)
  const keywords = simplifiedKeywordExtraction(plainText, 8)
  
  const metaTags = generateSeoMetaTagsFromCache(data.doc, data.config, data.pageUrl, { plainText, description, keywords })
  let jsonLd = generateArticleJsonLdFromCache(data.doc, data.config, data.pageUrl, { plainText, description, keywords })
  
  // 面包屑导航不需要缓存，每个文档都不同
  if (data.breadcrumbs && data.breadcrumbs.length > 0) {
    jsonLd += '\n' + generateBreadcrumbJsonLd(data.breadcrumbs)
  }
  
  return { metaTags, jsonLd }
}

/**
 * 从缓存生成SEO meta标签
 */
function generateSeoMetaTagsFromCache(
  doc: S_Node,
  config: Config,
  pageUrl: string,
  cache: { plainText: string; description: string; keywords: string[] }
): string {
  const title = doc.Properties?.title || '未命名文档'
  const { description, keywords } = cache

  let metaTags = ''

  // 基础 meta 标签
  metaTags += `  <meta name="description" content="${description.replace(/"/g, '&quot;')}" />\n`
  metaTags += `  <meta name="keywords" content="${keywords.join(', ')}" />\n`
  metaTags += `  <meta name="author" content="${config.sitemap?.title || '崮生'}" />\n`

  // Open Graph 标签
  metaTags += `  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />\n`
  metaTags += `  <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />\n`
  metaTags += `  <meta property="og:type" content="article" />\n`
  metaTags += `  <meta property="og:url" content="${pageUrl}" />\n`
  metaTags += `  <meta property="og:site_name" content="${config.sitemap?.title || 'OceanPress'}" />\n`

  if (doc.Properties?.['title-img']) {
    const imageUrl = `${config.sitemap?.siteLink || ''}${doc.Properties['title-img'].replace('assets', '/assets')}`
    metaTags += `  <meta property="og:image" content="${imageUrl}" />\n`
    metaTags += `  <meta property="og:image:width" content="1200" />\n`
    metaTags += `  <meta property="og:image:height" content="630" />\n`
  }

  // 从ID中提取创建时间
  const datePublished = extractDateFromId(doc.ID)
  const dateModified = formatDate(doc.Properties?.updated)

  metaTags += `  <meta property="article:published_time" content="${datePublished}" />\n`
  metaTags += `  <meta property="article:modified_time" content="${dateModified}" />\n`

  // Twitter Card 标签
  metaTags += `  <meta name="twitter:card" content="summary_large_image" />\n`
  metaTags += `  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />\n`
  metaTags += `  <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />\n`

  if (doc.Properties?.['title-img']) {
    const imageUrl = `${config.sitemap?.siteLink || ''}${doc.Properties['title-img'].replace('assets', '/assets')}`
    metaTags += `  <meta name="twitter:image" content="${imageUrl}" />\n`
  }

  // 其他 SEO 标签
  metaTags += `  <meta name="robots" content="index, follow" />\n`
  metaTags += `  <link rel="canonical" href="${pageUrl}" />\n`

  return metaTags
}

/**
 * 从缓存生成JSON-LD
 */
function generateArticleJsonLdFromCache(
  doc: S_Node,
  config: Config,
  pageUrl: string,
  cache: { plainText: string; description: string; keywords: string[] }
): string {
  const title = doc.Properties?.title || '未命名文档'
  const { description, keywords } = cache
  const datePublished = extractDateFromId(doc.ID)
  const dateModified = formatDate(doc.Properties?.updated)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    keywords: keywords.join(', '),
    datePublished: datePublished,
    dateModified: dateModified,
    author: {
      '@type': 'Person',
      name: config.sitemap?.title || '崮生',
      url: config.sitemap?.siteLink || ''
    },
    publisher: {
      '@type': 'Organization',
      name: config.sitemap?.title || 'OceanPress',
      logo: {
        '@type': 'ImageObject',
        url: `${config.sitemap?.siteLink || ''}/assets/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl
    },
    image: doc.Properties?.['title-img'] ? {
      '@type': 'ImageObject',
      url: `${config.sitemap?.siteLink || ''}${doc.Properties['title-img'].replace('assets', '/assets')}`,
      width: 1200,
      height: 630
    } : undefined,
    wordCount: cache.plainText.length,
    articleSection: '技术文档',
    inLanguage: 'zh-CN'
  }

  return `<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>`
}

/**
 * 从纯文本提取描述（优化版本）
 */
function extractDescriptionFromPlainText(plainText: string, maxLength = 160): string {
  if (plainText.length <= maxLength) return plainText

  const truncated = plainText.substring(0, maxLength)
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('。'),
    truncated.lastIndexOf('！'),
    truncated.lastIndexOf('？'),
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  )

  return lastSentenceEnd > maxLength * 0.7 
    ? truncated.substring(0, lastSentenceEnd + 1)
    : truncated + '...'
}