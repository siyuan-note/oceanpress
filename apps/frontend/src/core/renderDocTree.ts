import { Effect } from 'effect'
import { EffectConfigDep } from './EffectDep.ts'
import type { DB_block } from './siyuan_type.ts'
import { allDocBlock_by_bookId } from './cache.ts'
import { API } from './siyuan_api.ts'
import { tempConfig } from './config.ts'

export const renderDocTreeJsPath = `/__oceanpress/docTree.js`
/** 生成文档树 JS 文件 */
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
    
    // 生成 JS 代码
    const jsCode = generateJSTree(tree)
    return `
// OceanPress DocTree - 动态加载的文档树
(function() {
  'use strict';
  
  // 文档树数据
  const docTreeData = ${jsCode};
  
  // 渲染函数
  function renderDocTree(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }
    
    const currentPath = options.currentPath || window.location.pathname.replace(/\\.html$/, '');
    
    // 生成 HTML
    const html = generateHTMLTree(docTreeData, currentPath);
    container.innerHTML = html;
    
    // 加载样式
    loadStyles();
    
    // 初始化交互
    initInteractions(container, currentPath);
  }
  
  // 检查是否为单一路径（只有单个子节点的文件夹）
  function isSinglePath(node) {
    if (!node.children || node.children.length !== 1) {
      return false;
    }
    
    let current = node;
    while (current.children && current.children.length === 1) {
      current = current.children[0];
    }
    
    // 如果最终节点没有子节点，说明是单一路径
    return !current.children || current.children.length === 0;
  }

  // 获取单一路径的所有节点
  function getSinglePathNodes(node) {
    const pathNodes = [node];
    let current = node;
    
    while (current.children && current.children.length === 1) {
      current = current.children[0];
      pathNodes.push(current);
    }
    
    return pathNodes;
  }

  // 生成面包屑路径
  function generateBreadcrumb(pathNodes, currentPath) {
    const lastNode = pathNodes[pathNodes.length - 1];
    const isCurrent = lastNode.hpath === currentPath;
    
    let breadcrumbHtml = '<div class="breadcrumb-path">';
    
    pathNodes.forEach((node, index) => {
      if (index > 0) {
        breadcrumbHtml += '<span class="breadcrumb-separator">/</span>';
      }
      
      const isLast = index === pathNodes.length - 1;
      const nodeCurrent = node.hpath === currentPath;
      
      breadcrumbHtml += \`
        <a href="\${node.hpath}.html" class="breadcrumb-part \${(isLast && isCurrent) ? 'current' : ''}" target="_top">\${node.title}</a>
      \`;
    });
    
    breadcrumbHtml += '</div>';
    return breadcrumbHtml;
  }

  // 生成 HTML 树
  function generateHTMLTree(nodes, currentPath, level = 0) {
    let html = '';
    for (const node of nodes) {
      const isCurrent = node.hpath === currentPath;
      const isActive = isCurrent || (currentPath && node.hpath && currentPath.startsWith(node.hpath));
      
      // 检查是否为单一路径，如果是则显示为面包屑
      if (isSinglePath(node)) {
        const pathNodes = getSinglePathNodes(node);
        html += generateBreadcrumb(pathNodes, currentPath);
        continue;
      }
      
      if (node.children && node.children.length > 0) {
        // 有子节点时使用 details/summary
        const isExpanded = isActive ? 'open' : '';
        html += \`
          <details class="folder" \${isExpanded}>
            <summary class="folder-summary">
              <a href="\${node.hpath}.html" class="folder-link \${isCurrent ? 'current' : ''}" target="_top">\${node.title}</a>
            </summary>
            <div class="folder-children" style="padding:0 0 0 10px;">
              \${generateHTMLTree(node.children, currentPath, level + 1)}
            </div>
          </details>
        \`;
      } else {
        // 没有子节点的普通项目
        html += \`
          <div class="file \${isCurrent ? 'current' : ''}">
            <a href="\${node.hpath}.html" class="file-link" target="_top">\${node.title}</a>
          </div>
        \`;
      }
    }
    return html;
  }
  
  // 加载样式
  function loadStyles() {
    if (document.getElementById('oceanpress-doctree-styles')) return;
    
    const link = document.createElement('link');
    link.id = 'oceanpress-doctree-styles';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = '${tempConfig.cdn.siyuanPrefix}appearance/docTree.css';
    document.head.appendChild(link);
  }
  
  // 初始化交互
  function initInteractions(container, currentPath) {
    // 为当前页面项添加高亮样式
    const currentItems = container.querySelectorAll('.current');
    currentItems.forEach(item => {
      // 如果是面包屑路径中的当前项，需要特殊处理
      if (item.classList.contains('breadcrumb-part')) {
        item.style.fontWeight = 'bold';
        item.style.color = 'var(--oceanpress-sidebar-current-border)';
      } else {
        // 使用 CSS 变量而不是硬编码颜色
        item.style.backgroundColor = 'var(--oceanpress-sidebar-current-bg)';
        item.style.borderLeft = '3px solid var(--oceanpress-sidebar-current-border)';
        item.style.paddingLeft = '7px';
      }
    });
    
    // 自动滚动到当前页面
    const firstCurrent = container.querySelector('.current');
    if (firstCurrent) {
      setTimeout(() => {
        firstCurrent.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
    
    // 监听主题变化事件，更新高亮样式
    window.addEventListener('oceanpress-theme-changed', function(e) {
      currentItems.forEach(item => {
        if (item.classList.contains('breadcrumb-part')) {
          item.style.fontWeight = 'bold';
          item.style.color = 'var(--oceanpress-sidebar-current-border)';
        } else {
          item.style.backgroundColor = 'var(--oceanpress-sidebar-current-bg)';
          item.style.borderLeft = '3px solid var(--oceanpress-sidebar-current-border)';
        }
      });
    });
  }
  
  // 暴露到全局
  window.OceanPressDocTree = {
    render: renderDocTree,
    data: docTreeData
  };
  
  // 自动渲染（如果容器存在）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('oceanpress-doctree')) {
        renderDocTree('oceanpress-doctree');
      }
    });
  } else {
    if (document.getElementById('oceanpress-doctree')) {
      renderDocTree('oceanpress-doctree');
    }
  }
})();
    `
  })
}

/** 生成 JavaScript 格式的文档树数据 */
function generateJSTree(nodes: DocNode[]): string {
  return JSON.stringify(nodes, null, 2);
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
