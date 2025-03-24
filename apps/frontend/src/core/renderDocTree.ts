import { Effect } from 'effect'
import { EffectConfigDep } from './EffectDep.ts'
import type { DB_block } from './siyuan_type.ts'
import { allDocBlock_by_bookId } from './cache.ts'
import { API } from './siyuan_api.ts'
import { tempConfig } from './config.ts'

/** 生成文档树 */
export function renderDocTree() {
  return Effect.gen(function* () {
    const config = yield* EffectConfigDep
    const Doc_blocks: DB_block[] = yield* Effect.tryPromise(() =>
      allDocBlock_by_bookId(config.notebook.id),
    )
    /** 获取文档树排序信息 */
    const sortJSON: { [id: string]: number | undefined } =
      yield* Effect.tryPromise(() =>
        API.file_getFile({
          path: `/data/${config.notebook.id}/.siyuan/sort.json`,
        }).then((r) => {
          // 1. 将 ArrayBuffer 转为字符串
          const decoder = new TextDecoder('utf-8')
          const jsonString = decoder.decode(r as ArrayBuffer)
          // 2. 解析字符串为 JSON 对象
          return JSON.parse(jsonString)
        }),
      )
    const docs = Doc_blocks.map((el) => ({
      id: el.id,
      /** 类似 '/record/cssFlex' */
      hpath: el.hpath,
      title: el.content,
      sort: sortJSON[el.id],
    }))
    const tree = buildTree(docs)
    console.log('[generateHTMLTree(tree)]', generateHTMLTree(tree))
    //根据 tree 生成对应的 html 目录树
    const contentHtml = generateHTMLTree(tree)
    return `
     <link rel="stylesheet" type="text/css" href="${tempConfig.cdn.siyuanPrefix}appearance/docTree.css"/>
    ${contentHtml}
    `
  })
}

/** 生成可点击的HTML目录树（使用details标签实现折叠，全页面跳转） */
function generateHTMLTree(nodes: DocNode[], level = 0): string {
  let html = ''
  for (const node of nodes) {
    if (node.children && node.children.length > 0) {
      // 有子节点时使用details/summary实现折叠
      html += `
          <details class="folder">
            <summary class="folder-summary">
              <a href="${node.hpath}" class="folder-link" target="_top">${
        node.title
      }</a>
            </summary>
            <div class="folder-children" style="padding:0 0 0 10px;">
              ${generateHTMLTree(node.children, level + 1)}
            </div>
          </details>
        `
    } else {
      // 没有子节点的普通项目
      html += `
          <div class="file">
            <a href="${node.hpath}" class="file-link" target="_top">${node.title}</a>
          </div>
        `
    }
  }

  return html
}

interface DocNode {
  id: string
  hpath: string
  title: string
  sort: number | undefined
  children?: DocNode[]
}

function buildTree(docs: DocNode[]): DocNode[] {
  // 1. 创建根节点和路径映射
  const root: DocNode[] = []
  const pathMap: Record<string, DocNode> = {}

  // 2. 先按 hpath 排序，确保父节点先处理
  docs.sort((a, b) => a.hpath.localeCompare(b.hpath))

  // 3. 构建树结构
  for (const doc of docs) {
    const pathParts = doc.hpath.split('/').filter((part) => part !== '')
    let currentPath = ''
    let parentNode: DocNode | undefined = undefined

    // 逐级查找或创建父节点
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentPath += '/' + pathParts[i]
      if (!pathMap[currentPath]) {
        // 创建虚拟父节点
        pathMap[currentPath] = {
          id: 'virtual_' + currentPath,
          hpath: currentPath,
          title: pathParts[i],
          sort: undefined,
          children: [],
        }
        // 添加到父节点的children中
        if (parentNode) {
          parentNode.children = parentNode.children || []
          parentNode.children.push(pathMap[currentPath])
        } else {
          root.push(pathMap[currentPath])
        }
      }
      parentNode = pathMap[currentPath]
    }

    // 添加当前节点
    if (parentNode) {
      parentNode.children = parentNode.children || []
      parentNode.children.push(doc)
    } else {
      root.push(doc)
    }
    pathMap[doc.hpath] = doc
  }

  // 4. 递归排序
  function sortNodes(nodes: DocNode[]): DocNode[] {
    return nodes
      .map((node) => {
        if (node.children) {
          node.children = sortNodes(node.children)
        }
        return node
      })
      .sort((a, b) => {
        // 有sort值的优先按sort排序，没有sort值的按title排序
        if (a.sort !== undefined && b.sort !== undefined) {
          return a.sort - b.sort
        } else if (a.sort !== undefined) {
          return -1
        } else if (b.sort !== undefined) {
          return 1
        } else {
          return (a.title || '').localeCompare(b.title || '')
        }
      })
  }

  return sortNodes(root)
}
