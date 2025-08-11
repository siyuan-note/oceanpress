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
 * TF-IDF 关键词提取算法
 */
class TFIDFKeywordExtractor {
  private stopWords = new Set([
    // 中文停用词
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '现在', '可以', '但是', '还是', '因为', '什么', '如果', '所以', '对于', '关于', '通过', '进行', '基于', '以及', '或者', '而且', '然后', '只是', '已经', '正在', '应该', '能够', '需要', '可能', '一定', '这样', '那样', '怎么', '为什么', '哪里', '哪个', '多少', '几个', '什么', '怎么', '如何', '为什么',
    // 英文停用词
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'not', 'no', 'yes', 'so', 'if', 'when', 'where', 'how', 'why', 'what', 'which', 'who', 'whom', 'there', 'here'
  ])

  /**
   * 计算词频 (TF)
   */
  private calculateTermFrequency(text: string): Map<string, number> {
    const words = this.tokenize(text)
    const tf = new Map<string, number>()
    const totalWords = words.length

    for (const word of words) {
      tf.set(word, (tf.get(word) || 0) + 1)
    }

    // 标准化词频
    for (const [word, count] of tf) {
      tf.set(word, count / totalWords)
    }

    return tf
  }

  /**
   * 分词处理（针对中文和英文优化）
   */
  private tokenize(text: string): string[] {
    const tokens: string[] = []

    // 首先彻底清理HTML标签和属性，只保留纯文本内容
    const plainText = text
      .replace(/<[^>]*>/g, ' ')  // 移除所有HTML标签
      .replace(/&[^;]+;/g, ' ')  // 移除HTML实体
      .replace(/\s+/g, ' ')       // 合并多个空格
      .trim()

    // 1. 提取英文单词和技术术语（优先处理）
    const englishWords = plainText.match(/[a-zA-Z]{3,}/g) || []
    tokens.push(...englishWords.map(word => word.toLowerCase()).filter(word => !this.stopWords.has(word)))

    // 2. 提取驼峰命名（如 useState, useEffect）
    const camelCaseWords = plainText.match(/[a-z]+[A-Z][a-zA-Z0-9]*|[A-Z][a-z0-9]+[A-Z][a-zA-Z0-9]*/g) || []
    tokens.push(...camelCaseWords.map(word => word.toLowerCase()))

    // 3. 智能中文分词 - 基于文本特征分析
    const chineseTokens = this.extractChineseTokens(plainText)
    tokens.push(...chineseTokens)

    // 4. 后处理：过滤掉无意义的词汇
    const filteredTokens = tokens.filter(token => {
      // 过滤掉长度小于2的词汇
      if (token.length < 2) return false

      // 过滤掉HTML相关的无意义词汇
      const htmlRelatedWords = ['div', 'span', 'class', 'id', 'type', 'data', 'href', 'src', 'alt', 'title', 'style', 'width', 'height', 'rootid', 'endid', 'nodedocument', 'ezcqbj', 'cktc', 'quot']
      if (htmlRelatedWords.includes(token.toLowerCase())) {
        return false
      }

      // 过滤掉看起来像属性名或ID的词汇
      if (token.match(/^[a-f0-9]{6,}$/)) return false // 过滤掉十六进制ID

      // 过滤掉看起来不像是完整词汇的中文词汇
      if (/[\u4e00-\u9fa5]/.test(token) && token.length < 2) {
        return false
      }

      return true
    })

    return filteredTokens
  }

  /**
   * 智能中文分词 - 基于文本特征分析
   */
  private extractChineseTokens(text: string): string[] {
    const tokens: string[] = []

    // 提取中文文本
    const chineseText = text.replace(/[^\u4e00-\u9fa5\s]/g, ' ')

    // 基于常见中文词汇模式进行提取
    // 2-4字的中文词汇通常是完整的词汇
    const wordPatterns = [
      /[\u4e00-\u9fa5]{4}/g,  // 4字词汇
      /[\u4e00-\u9fa5]{3}/g,  // 3字词汇
      /[\u4e00-\u9fa5]{2}/g,  // 2字词汇
    ]

    for (const pattern of wordPatterns) {
      const matches = chineseText.match(pattern) || []
      for (const word of matches) {
        if (!this.stopWords.has(word) && this.isMeaningfulChineseWord(word)) {
          tokens.push(word.toLowerCase())
        }
      }
    }

    return tokens
  }

  /**
   * 判断是否为有意义的中文词汇
   */
  private isMeaningfulChineseWord(word: string): boolean {
    // 过滤掉常见的无意义组合
    const meaninglessPatterns = [
      /^的.*$/, /^.*的$/, /^了.*$/, /^.*了$/,
      /^在.*$/, /^.*在$/, /^是.*$/, /^.*是$/,
      /^我.*$/, /^.*我$/, /^有.*$/, /^.*有$/,
      /^和.*$/, /^.*和$/, /^就.*$/, /^.*就$/,
      /^不.*$/, /^.*不$/, /^人.*$/, /^.*人$/
    ]

    for (const pattern of meaninglessPatterns) {
      if (pattern.test(word)) {
        return false
      }
    }

    // 检查是否包含重复字符
    if (/(.)\1{2,}/.test(word)) {
      return false
    }

    return true
  }

  /**
   * 计算逆文档频率 (IDF) - 简化版本
   */
  private calculateInverseDocumentFrequency(term: string): number {
    // 简化的IDF计算，基于常见词汇频率
    const commonTerms = new Set([
      '技术', '开发', '代码', '系统', '数据', '功能', '应用', '实现', '方法', '问题',
      'time', 'data', 'system', 'code', 'development', 'application', 'function', 'method', 'problem', 'solution'
    ])

    if (commonTerms.has(term.toLowerCase())) {
      return Math.log(1000 / 500) // 常见词汇权重较低
    }

    return Math.log(1000 / 10) // 稀有词汇权重较高
  }

  /**
   * 提取关键词
   */
  extractKeywords(content: string, maxKeywords: number = 10): string[] {
    const tf = this.calculateTermFrequency(content)
    const keywordScores = new Map<string, number>()

    // 计算 TF-IDF 分数
    for (const [term, frequency] of tf) {
      const idf = this.calculateInverseDocumentFrequency(term)
      const tfidf = frequency * idf

      // 额外的权重规则
      let bonus = 1

      // 标题中的词汇权重更高
      if (content.toLowerCase().includes(term.toLowerCase()) &&
          (content.match(new RegExp(`^${term}`, 'mi')) || content.match(new RegExp(`${term}$`, 'mi')))) {
        bonus *= 1.5
      }

      // 长度适中的词汇权重更高
      if (term.length >= 2 && term.length <= 6) {
        bonus *= 1.2
      }

      keywordScores.set(term, tfidf * bonus)
    }

    // 排序并返回前N个关键词
    return Array.from(keywordScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([term]) => term)
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
 * 从内容中提取关键词（使用TF-IDF算法）
 */
function extractKeywords(content: string): string[] {
  const tfidfExtractor = new TFIDFKeywordExtractor()
  return tfidfExtractor.extractKeywords(content, 8)
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