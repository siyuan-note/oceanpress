import type { OceanPressPlugin } from '~/core/ocean_press.ts'
import type { FileTree } from '~/core/build.ts'
import { promises as fs } from 'fs'
import path from 'path'
// @ts-ignore - turndown 类型定义问题
import TurndownService from 'turndown'

export interface MarkdownMirrorConfig {
  /** 是否启用 Markdown 镜像导出 */
  enable: boolean
  /** 镜像输出目录（绝对路径） */
  outputDir: string
  /** 是否同步资源文件 */
  includeAssets: boolean
  /** 是否启用定时同步（利用增量编译） */
  watchMode: boolean
  /** 定时同步间隔（毫秒），默认 60 秒 */
  watchInterval?: number
  /** 是否移除头部和底部（侧边栏、导航、footer 等） */
  removeTemplate?: boolean
}

export class MarkdownMirrorPlugin implements OceanPressPlugin {
  name = 'MarkdownMirrorPlugin'
  private watchTimer?: ReturnType<typeof setInterval>

  constructor(private config: MarkdownMirrorConfig) {
    // 如果启用监听模式，启动定时任务
    if (this.config.watchMode) {
      this.startWatchMode()
    }
  }

  /** 启动定时监听模式 */
  private startWatchMode() {
    const interval = this.config.watchInterval || 60000 // 默认 60 秒

    console.log(`\n🔄 Markdown 镜像监听模式已启动，每 ${interval / 1000} 秒同步一次\n`)

    this.watchTimer = setInterval(() => {
      console.log('\n⏰ 定时任务触发，开始同步...')
      // 注意：这里需要触发重新构建，实际使用时需要从外部调用 build
      console.log('💡 请使用定时任务（如 cron）定期执行 oceanpress build 命令')
    }, interval)
  }

  /** 停止监听模式 */
  stopWatchMode() {
    if (this.watchTimer) {
      clearInterval(this.watchTimer)
      this.watchTimer = undefined
      console.log('🛑 Markdown 镜像监听模式已停止')
    }
  }

  /** 拦截 build，添加 Markdown 导出回调 */
  build: OceanPressPlugin['build'] = function ([config, otherConfig], next) {
    // 如果启用了 Markdown 镜像且要求移除模板，临时修改配置
    const modifiedConfig = config.markdownMirror?.enable && config.markdownMirror.removeTemplate
      ? {
          ...config,
          sidebarCode: {
            ...config.sidebarCode,
            enableDocTree: false,
            leftCode: '',
            rightCode: '',
          },
          embedCode: {
            ...config.embedCode,
            head: '',
            beforeBody: '',
            afterBody: '',
          },
        }
      : config

    return next(modifiedConfig, {
      ...otherConfig,
      beforeFileTree: async (tree: FileTree, effectApi: any) => {
        // 先执行原有的 beforeFileTree 回调（如果有的话）
        if (otherConfig?.beforeFileTree) {
          await otherConfig.beforeFileTree(tree, effectApi)
        }

        // 执行 Markdown 镜像导出
        if (modifiedConfig.markdownMirror?.enable) {
          effectApi.log('\n=== 开始 Markdown 镜像导出 ===')

          try {
            await exportMarkdown(
              tree,
              modifiedConfig.markdownMirror.outputDir,
              modifiedConfig.markdownMirror.includeAssets
            )
            effectApi.log('=== Markdown 镜像导出完成 ===\n')

            // 如果是监听模式，显示下次同步时间
            if (modifiedConfig.markdownMirror.watchMode) {
              const interval = modifiedConfig.markdownMirror.watchInterval || 60000
              effectApi.log(`⏰ 下次同步: ${new Date(Date.now() + interval).toLocaleTimeString()}\n`)
            }

            // 从文件树中删除所有 HTML 文件（不包括 assets 目录下的），这样它们不会被写入磁盘
            const allHtmlFiles = Object.keys(tree).filter(path => path.endsWith('.html') && !path.startsWith('assets/'))
            allHtmlFiles.forEach(htmlPath => {
              delete tree[htmlPath]
            })
            effectApi.log(`🗑️  已从文件树中移除 ${allHtmlFiles.length} 个 HTML 文件（不写入磁盘）\n`)
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

/** 从 HTML 文件树导出 Markdown 文件 */
async function exportMarkdown(tree: FileTree, outputDir: string, includeAssets: boolean = false) {
  // 确保输出目录存在
  await fs.mkdir(outputDir, { recursive: true })

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

  // 转换每个 HTML 文件为 Markdown
  let exportedCount = 0
  let skippedCount = 0

  for (const [htmlPath, htmlContent] of htmlFiles) {
    try {
      // 计算对应的 Markdown 文件路径
      const mdPath = htmlPath.replace(/\.html$/, '.md')
      const outputPath = path.join(outputDir, mdPath)

      // 增量更新：检查文件是否已存在且内容相同
      const htmlStr = htmlContent.toString()
      let markdown = turndownService.turndown(htmlStr)

      // 移除开头的多余空行和空格
      markdown = markdown.trimStart()

      // 后处理：移除代码块前的单独语言标识行
      // Turndown 将思源的代码块语言标识转换成了单独的一行
      // 格式：\n语言名\n\n```语言名\n
      // 我们需要把它移除
      markdown = markdown.replace(/\n([a-z]+)\n\n(```[a-z]+\n)/g, '\n$2')

      try {
        const existingContent = await fs.readFile(outputPath, 'utf-8')
        if (existingContent === markdown) {
          skippedCount++
          continue
        }
      } catch {
        // 文件不存在，需要创建
      }

      // 确保目录存在
      const dir = path.dirname(outputPath)
      await fs.mkdir(dir, { recursive: true })

      // 写入 Markdown 文件
      await fs.writeFile(outputPath, markdown, 'utf-8')
      exportedCount++

      console.log(`✅ [${exportedCount}] ${mdPath}`)
    } catch (error) {
      console.error(`❌ 转换失败: ${htmlPath}`, error)
    }
  }

  if (skippedCount > 0) {
    console.log(`⏭️  跳过 ${skippedCount} 个未变更的文件`)
  }

  console.log(`\n🎉 成功导出 ${exportedCount} 个 Markdown 文件到: ${outputDir}`)

  // 同步资源文件（如果启用）
  if (includeAssets) {
    await syncAssets(tree, outputDir)
  }
}

/** 同步资源文件 */
async function syncAssets(tree: FileTree, outputDir: string) {
  console.log('\n📦 开始同步资源文件...')

  const assetsDir = path.join(outputDir, 'assets')
  await fs.mkdir(assetsDir, { recursive: true })

  // 筛选出所有资源文件
  const assetFiles = Object.entries(tree).filter(([filePath]) =>
    filePath.startsWith('assets/')
  )

  console.log(`📦 找到 ${assetFiles.length} 个资源文件\n`)

  // 复制资源文件（增量更新）
  let copiedCount = 0
  let skippedCount = 0

  for (const [assetPath, assetContent] of assetFiles) {
    try {
      const outputPath = path.join(outputDir, assetPath)

      // 检查文件是否已存在
      try {
        const existingStats = await fs.stat(outputPath)
        const existingContent = await fs.readFile(outputPath)

        let currentContent: Buffer
        if (typeof assetContent === 'string') {
          currentContent = Buffer.from(assetContent, 'utf-8')
        } else {
          currentContent = Buffer.from(assetContent)
        }

        // 比较文件大小和内容
        if (existingStats.size === currentContent.length &&
            existingContent.equals(currentContent)) {
          skippedCount++
          continue
        }
      } catch {
        // 文件不存在，需要创建
      }

      // 确保目录存在
      const dir = path.dirname(outputPath)
      await fs.mkdir(dir, { recursive: true })

      // 写入资源文件
      if (typeof assetContent === 'string') {
        await fs.writeFile(outputPath, assetContent, 'utf-8')
      } else {
        await fs.writeFile(outputPath, Buffer.from(assetContent))
      }

      copiedCount++
      console.log(`📦 [${copiedCount}] ${assetPath}`)
    } catch (error) {
      console.error(`❌ 复制失败: ${assetPath}`, error)
    }
  }

  if (skippedCount > 0) {
    console.log(`⏭️  跳过 ${skippedCount} 个未变更的资源文件`)
  }

  console.log(`\n🎉 成功同步 ${copiedCount} 个资源文件`)
}
