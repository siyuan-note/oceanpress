/**
 * SEO 优化和结构化数据生成工具
 * 为 OceanPress 生成的 HTML 页面添加 JSON-LD 结构化数据和其他 SEO 优化
 */

import { Config } from './config.ts'
import { S_Node } from './siyuan_type.ts'


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
 * 从文档内容中提取描述文本
 */
function extractDescription(content: string, maxLength = 160): string {
  // 移除 HTML 标签
  const plainText = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  if (plainText.length <= maxLength) return plainText
  
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
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1)
  }
  
  return truncated + '...'
}

/**
 * 从内容中提取关键词
 */
function extractKeywords(content: string): string[] {
  // 移除 HTML 标签和特殊字符
  const plainText = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\u4e00-\u9fa5\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  // 简单的关键词提取（可以后续改进）
  const words = plainText.split(/\s+/)
  const keywords: string[] = []
  
  // 提取中文词汇（2-4个字符）
  const chineseWords = plainText.match(/[\u4e00-\u9fa5]{2,4}/g) || []
  keywords.push(...chineseWords.slice(0, 5))
  
  // 提取英文单词（长度大于3的单词）
  const englishWords = words.filter(word => 
    word.length > 3 && /^[a-zA-Z]+$/.test(word)
  )
  keywords.push(...englishWords.slice(0, 3))
  
  // 去重并限制数量
  return [...new Set(keywords)].slice(0, 8)
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
 * 生成完整的 SEO 优化代码
 */
export function generateSeoContent(data: SeoData): {
  metaTags: string
  jsonLd: string
} {
  const metaTags = generateSeoMetaTags(data.doc, data.config, data.pageUrl, data.content)
  
  let jsonLd = generateArticleJsonLd(data.doc, data.config, data.pageUrl, data.content)
  
  if (data.breadcrumbs && data.breadcrumbs.length > 0) {
    jsonLd += '\n' + generateBreadcrumbJsonLd(data.breadcrumbs)
  }
  
  return {
    metaTags,
    jsonLd
  }
}