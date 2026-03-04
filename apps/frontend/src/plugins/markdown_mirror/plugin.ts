import type { OceanPressPlugin } from '~/core/ocean_press.ts'
import type { FileTree } from '~/core/build.ts'
// @ts-ignore - turndown 类型定义问题
import TurndownService from 'turndown'

export interface MarkdownMirrorConfig {
  /** 是否启用 Markdown 镜像导出 */
  enable: boolean
  /** 是否同步资源文件 */
  includeAssets: boolean
}

export class MarkdownMirrorPlugin implements OceanPressPlugin {
  name = 'MarkdownMirrorPlugin'

  constructor(private config: MarkdownMirrorConfig) {
    // 无需初始化操作
  }

  /** 拦截 build，添加 Markdown 导出回调 */
  build: OceanPressPlugin['build'] = function ([config, otherConfig], next) {
    return next(config, {
      ...otherConfig,
      beforeFileTree: async (tree: FileTree, effectApi: any) => {
        // 先执行原有的 beforeFileTree 回调（如果有的话）
        if (otherConfig?.beforeFileTree) {
          await otherConfig.beforeFileTree(tree, effectApi)
        }

        // 执行 Markdown 镜像导出
        if (config.markdownMirror?.enable) {
          effectApi.log('\n=== 开始 Markdown 镜像导出 ===')

          try {
            convertHtmlToMarkdown(
              tree,
              config.markdownMirror.includeAssets
            )
            effectApi.log('=== Markdown 镜像导出完成 ===\n')
          } catch (error) {
            effectApi.log('❌ Markdown 镜像导出失败: ' + error)
          }
        }
      },
      onFileTree: async (tree: FileTree, effectApi: any) => {
        // 先执行原有的 onFileTree 回调
        if (otherConfig?.onFileTree) {
          await otherConfig.onFileTree(tree, effectApi)
        }
      },
    })
  }
}

/** 从 HTML 内容中提取所有标题的 ID 到标题文本的映射 */
function buildIdToHeadingMap(htmlContent: string): Map<string, string> {
  const idToHeading = new Map<string, string>()

  // 使用正则表达式匹配所有带 ID 的标题
  // 格式：<h1 id="xxx" ...>标题文本</h1>
  const headingRegex = /<h([1-6])\s+id="([^"]+)"[^>]*>(.*?)<\/h\1>/gi
  let match

  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const id = match[2]
    const headingText = match[3]
      // 移除 HTML 标签
      .replace(/<[^>]+>/g, '')
      // 解码 HTML 实体
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim()

    idToHeading.set(id, headingText)
  }

  return idToHeading
}

/** 将标题文本转换为 URL 友好的锚点格式 */
function headingToAnchor(headingText: string): string {
  return headingText
    .toLowerCase()
    // 移除特殊字符，保留中文、字母、数字、连字符和空格
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    // 将空格和连字符替换为单个连字符
    .replace(/[\s_]+/g, '-')
    // 移除开头和结尾的连字符
    .replace(/^-+|-+$/g, '')
}

/** 规范化文件路径，将相对路径转换为绝对路径 */
function normalizePath(relativePath: string): string {
  // 移除开头的 ./ 或 ../
  let normalized = relativePath.replace(/^\.\//, '')

  // 处理 ../
  while (normalized.startsWith('../')) {
    normalized = normalized.slice(3)
  }

  return normalized
}

/** 在文件树中将 HTML 转换为 Markdown */
function convertHtmlToMarkdown(tree: FileTree, includeAssets: boolean = false) {
  // 调试：输出文件树中的所有文件
  const allFiles = Object.keys(tree)
  console.log(`📂 文件树中共有 ${allFiles.length} 个文件`)
  if (allFiles.length > 0) {
    console.log('📂 前 10 个文件:', allFiles.slice(0, 10))
  }

  // 第一阶段：扫描所有 HTML 文件，建立全局的 ID 到标题映射
  const globalIdToHeading = new Map<string, string>()
  const htmlFiles = Object.entries(tree).filter(([filePath]) => filePath.endsWith('.html'))

  console.log('📖 正在扫描 HTML 文件以建立标题映射...')

  for (const [htmlPath, htmlContent] of htmlFiles) {
    const htmlStr = htmlContent.toString()
    const idToHeading = buildIdToHeadingMap(htmlStr)

    // 将文件路径前缀添加到 ID 中，形成全局唯一标识
    for (const [id, heading] of idToHeading.entries()) {
      // 使用 .md 路径作为键（因为链接会被转换为 .md）
      const mdPath = htmlPath.replace(/\.html$/, '.md')
      globalIdToHeading.set(`${mdPath}:${id}`, heading)
      // 也存储 .html 路径作为备份
      globalIdToHeading.set(`${htmlPath}:${id}`, heading)
      // 存储 ./ 前缀的路径
      globalIdToHeading.set(`./${mdPath}:${id}`, heading)
      globalIdToHeading.set(`./${htmlPath}:${id}`, heading)
    }
  }

  console.log(`✅ 建立了 ${globalIdToHeading.size} 个标题映射\n`)

  // 初始化 Turndown 服务
  const turndownService = new (TurndownService as any)({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  })

  // 添加自定义规则
  turndownService.addRule('remove-sidebars', {
    filter: (node: any) => {
      return node.id === 'oceanpress-left-sidebar' ||
             node.id === 'oceanpress-right-sidebar'
    },
    replacement: () => ''
  })

  // 移除 head、style、script 等标签
  turndownService.addRule('remove-html-metadata', {
    filter: (node: any) => {
      return ['head', 'style', 'script', 'noscript', 'link', 'meta', 'title'].includes(
        node.nodeName?.toLowerCase()
      )
    },
    replacement: () => ''
  })

  // 移除 JSON-LD 结构化数据
  turndownService.addRule('remove-json-ld', {
    filter: (node: any) => {
      return node.nodeName === 'SCRIPT' &&
             node.getAttribute('type') === 'application/ld+json'
    },
    replacement: () => ''
  })

  // 移除思源的配置脚本
  turndownService.addRule('remove-siyuan-config', {
    filter: (node: any) => {
      return node.nodeName === 'SCRIPT' &&
             node.textContent?.includes('window.siyuan')
    },
    replacement: () => ''
  })

  // 移除 footer 元素
  turndownService.addRule('remove-footer', {
    filter: (node: any) => {
      return node.nodeName === 'FOOTER' ||
             (node.nodeName === 'DIV' && node.classList?.contains('theme-aware-footer'))
    },
    replacement: () => ''
  })

  // 移除首页链接（在标题前的单独链接）
  turndownService.addRule('remove-home-link', {
    filter: (node: any) => {
      return node.nodeName === 'A' && node.getAttribute('href') === '/'
    },
    replacement: () => ''
  })

  // 转换内部链接：.html -> .md，并使用标题锚点
  turndownService.addRule('convert-internal-links', {
    filter: (node: any) => {
      return node.nodeName === 'A' && node.getAttribute('href')?.includes('.html')
    },
    replacement: (content: string, node: any) => {
      const href = node.getAttribute('href')
      if (!href) return content

      // 解析链接：提取路径和锚点
      const linkMatch = href.match(/^(.+?\.html)(#.+)?$/)
      if (!linkMatch) return `[${content}](${href})`

      const htmlPath = linkMatch[1]
      const anchor = linkMatch[2] || '' // #xxxxx

      // 规范化路径（移除 ../ 和 ./）
      const normalizedHtmlPath = normalizePath(htmlPath)
      const mdPath = normalizedHtmlPath.replace(/\.html$/, '.md')

      // 如果有锚点，尝试转换为标题锚点
      if (anchor) {
        const anchorId = anchor.slice(1) // 移除 #

        // 在全局映射中查找标题
        let headingText: string | undefined

        // 尝试不同的路径格式
        const possiblePaths = [
          `/${mdPath}:${anchorId}`,      // /工具/blender.md:xxx
          `${mdPath}:${anchorId}`,        // 工具/blender.md:xxx
          `/${normalizedHtmlPath}:${anchorId}`,
          `${normalizedHtmlPath}:${anchorId}`,
        ]

        for (const possiblePath of possiblePaths) {
          if (globalIdToHeading.has(possiblePath)) {
            headingText = globalIdToHeading.get(possiblePath)
            break
          }
        }

        if (headingText) {
          // 使用标题文本作为锚点
          const headingAnchor = headingToAnchor(headingText)
          // 如果原链接有 ../ 前缀，保留它
          const prefix = href.startsWith('../') ? '../' : (href.startsWith('./') ? './' : '')
          return `[${content}](${prefix}${mdPath}#${headingAnchor})`
        } else {
          // 调试：只记录前几个失败的链接
          if (Math.random() < 0.05) {
            console.warn(`⚠️  未找到标题映射: ${href}`)
            console.warn(`   尝试的路径:`, possiblePaths.slice(0, 2))
          }
        }
      }

      // 如果没有找到标题，不使用锚点
      const prefix = href.startsWith('../') ? '../' : (href.startsWith('./') ? './' : '')
      return `[${content}](${prefix}${mdPath})`
    }
  })

  // 转换代码块：将 <div class="hljs"> 转换为 Markdown 代码块
  turndownService.addRule('convert-code-blocks', {
    filter: (node: any) => {
      return node.nodeName === 'DIV' && node.classList?.contains('hljs')
    },
    replacement: (_content: string, node: any) => {
      const code = node.textContent || ''
      // 确定语言
      let language = ''

      // 检查前面的兄弟节点是否有语言标识
      const previousSibling = node.previousSibling
      if (previousSibling && previousSibling.nodeName === 'DIV') {
        const actionDiv = previousSibling.querySelector('.protyle-action--first')
        if (actionDiv) {
          const langText = actionDiv.textContent?.trim()
          if (langText && langText !== 'Copy') {
            language = langText.toLowerCase()
          }
        }
      }

      // 如果没有找到语言标识，尝试从内容检测
      if (!language) {
        if (code.includes('function ') || code.includes('const ') || code.includes('let ') || code.includes('=>') || code.includes('interface ')) {
          language = 'typescript'
        } else if (code.includes('def ') || code.includes('import ') || code.includes('class ')) {
          language = 'python'
        } else if (code.includes('SELECT ') || code.includes('INSERT ') || code.includes('UPDATE ')) {
          language = 'sql'
        }
      }

      return `\n\`\`\`${language}\n${code.trim()}\n\`\`\`\n`
    }
  })

  console.log(`📄 找到 ${htmlFiles.length} 个 HTML 文件\n`)

  // 转换每个 HTML 文件为 Markdown，直接在文件树上操作
  let convertedCount = 0

  for (const [htmlPath, htmlContent] of htmlFiles) {
    try {
      const mdPath = htmlPath.replace(/\.html$/, '.md')
      const htmlStr = htmlContent.toString()
      let markdown = turndownService.turndown(htmlStr)

      // 移除开头的多余空行和空格
      markdown = markdown.trimStart()

      // 后处理：移除代码块前的单独语言标识行
      markdown = markdown.replace(/\n([a-z]+)\n\n(```[a-z]+\n)/g, '\n$2')

      // 在文件树中添加 Markdown 文件
      tree[mdPath] = markdown

      // 删除原来的 HTML 文件
      delete tree[htmlPath]

      convertedCount++
      console.log(`✅ [${convertedCount}] ${htmlPath} → ${mdPath}`)
    } catch (error) {
      console.error(`❌ 转换失败: ${htmlPath}`, error)
    }
  }

  console.log(`\n🎉 成功转换 ${convertedCount} 个 HTML 文件为 Markdown`)

  // 如果不同步资源文件，删除 assets 目录
  if (!includeAssets) {
    const assetPaths = Object.keys(tree).filter(path => path.startsWith('assets/'))
    assetPaths.forEach(assetPath => {
      delete tree[assetPath]
    })
    if (assetPaths.length > 0) {
      console.log(`🗑️  已从文件树中移除 ${assetPaths.length} 个资源文件`)
    }
  }
}
