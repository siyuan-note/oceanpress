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
    /** 获取文档树排序信息（读取失败时回退为空，即按标题排序） */
    const sortJSON: { [id: string]: number | undefined } =
      yield* Effect.tryPromise({
        try: () =>
          API.file_getFile({
            path: `/data/${config.notebook.id}/.siyuan/sort.json`,
          }).then((r) => {
            // 1. 将 ArrayBuffer 转为字符串
            const decoder = new TextDecoder('utf-8')
            const jsonString = decoder.decode(r as ArrayBuffer)
            // 2. 解析字符串为 JSON 对象
            return JSON.parse(jsonString) as { [id: string]: number | undefined }
          }),
        catch: () => ({}) as { [id: string]: number | undefined },
      })
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
// OceanPress DocTree - 动态加载的文档树（思源风格）
(function () {
  'use strict';

  /** 展开状态持久化 key */
  const STORAGE_KEY = 'oceanpress-doctree-open';
  /** 默认展开层级（首次访问且无当前路径命中时） */
  const DEFAULT_OPEN_LEVEL = 1;

  // 文档树数据
  const docTreeData = ${jsCode};

  /** svg 图标，与思源 material icon.js 中的 symbol id 对应 */
  const ICONS = {
    arrow: '<svg><use xlink:href="#iconRight"></use></svg>',
    folder: '<svg><use xlink:href="#iconFolder"></use></svg>',
    file: '<svg><use xlink:href="#iconFile"></use></svg>',
    title: '<svg><use xlink:href="#iconFiles"></use></svg>',
    menu: '<svg><use xlink:href="#iconMenu"></use></svg>'
  };

  /** 获取当前页面对应的树节点 hpath（去除 .html / index.html 后缀并解码中文） */
  function getCurrentPath() {
    let p = window.location.pathname;
    if (/(^|\\/)index\\.html$/.test(p)) {
      /** 站点根的 index.html：hpath 为 /index（思源文档树的根节点） */
      p = p.replace(/index\\.html$/, 'index');
    } else if (p === '/' || p === '') {
      /** 以目录形式访问站点根：同样映射到 /index */
      p = '/index';
    } else {
      /** 普通文档页：去掉 .html 后缀 */
      p = p.replace(/\\.html$/, '');
    }
    try { p = decodeURIComponent(p); } catch (e) { /* 已是明文则保留原样 */ }
    return p;
  }

  /** 读取持久化的展开节点集合 */
  function loadOpenState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (e) { return new Set(); }
  }

  /** 持久化展开节点集合 */
  function saveOpenState(set) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch (e) { /* 忽略存储异常（隐私模式等） */ }
  }

  /** 判断节点是否应展开：包含当前路径的祖先必展开；其余看用户操作记录；都没有则按默认层级 */
  function shouldOpen(node, currentPath, openSet) {
    if (currentPath === node.hpath || (currentPath && currentPath.startsWith(node.hpath + '/'))) {
      return true;
    }
    if (openSet.size > 0 || currentPath) return openSet.has(node.hpath);
    return (node.hpath.match(/\\//g) || []).length < DEFAULT_OPEN_LEVEL;
  }

  /** HTML 转义 */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** 递归生成 ul/li 嵌套列表 HTML */
  function generateHTMLTree(nodes, currentPath, openSet, isChild) {
    let html = '<ul>';
    for (const node of nodes) {
      const hasChildren = node.children && node.children.length > 0;
      const isCurrent = node.hpath === currentPath;
      const isOpen = hasChildren && shouldOpen(node, currentPath, openSet);

      const classes = ['b3-list-item'];
      if (isChild) classes.push('b3-list-item--child');
      if (isOpen) classes.push('b3-list-item--open');
      if (isCurrent) classes.push('b3-list-item--focus');

      const arrow = hasChildren
        ? '<span class="b3-list-item__toggle" data-op="toggle" role="button" aria-label="展开/折叠"><span class="b3-list-item__arrow">' + ICONS.arrow + '</span></span>'
        : '<span class="b3-list-item__arrow b3-list-item__arrow--placeholder">' + ICONS.arrow + '</span>';

      const icon = '<span class="b3-list-item__icon" aria-hidden="true">' + (hasChildren ? ICONS.folder : ICONS.file) + '</span>';
      const text = '<span class="b3-list-item__text" title="' + escapeHtml(node.title) + '">' + escapeHtml(node.title) + '</span>';
      const link = '<a class="b3-list-item__link" data-op="link" href="' + encodeURI(node.hpath) + '.html" target="_top">' + icon + text + '</a>';

      html += '<li class="' + classes.join(' ') + '" data-hpath="' + escapeHtml(node.hpath) + '">' + arrow + link + '</li>';

      if (hasChildren) {
        const childrenUL = generateHTMLTree(node.children, currentPath, openSet, true)
          .replace('<ul', '<ul data-children-of="' + escapeHtml(node.hpath) + '"');
        html += isOpen ? childrenUL : childrenUL.replace('<ul', '<ul hidden');
      }
    }
    return html + '</ul>';
  }

  // 渲染函数
  function renderDocTree(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('Container not found:', containerId);
      return;
    }

    const currentPath = options.currentPath !== undefined ? options.currentPath : getCurrentPath();
    const openSet = loadOpenState();

    // 生成 HTML
    container.innerHTML = generateHTMLTree(docTreeData, currentPath, openSet, false);

    // 加载样式
    loadStyles();

    // 初始化交互
    initInteractions(container, openSet);
    initDrawer();

    // 自动滚动到当前页面
    const firstCurrent = container.querySelector('.b3-list-item--focus');
    if (firstCurrent) {
      setTimeout(function () {
        firstCurrent.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
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

  // 初始化交互：事件委托处理展开/折叠
  function initInteractions(container, openSet) {
    container.addEventListener('click', function (e) {
      const toggle = e.target.closest('[data-op="toggle"]');
      if (!toggle) return;
      e.preventDefault();
      e.stopPropagation();

      const li = toggle.closest('.b3-list-item');
      if (!li) return;

      const hpath = li.getAttribute('data-hpath');
      const childrenUL = container.querySelector('ul[data-children-of="' + CSS.escape(hpath) + '"]');
      if (!childrenUL) return;

      const willOpen = childrenUL.hasAttribute('hidden');
      if (willOpen) {
        childrenUL.removeAttribute('hidden');
        li.classList.add('b3-list-item--open');
        openSet.add(hpath);
      } else {
        childrenUL.setAttribute('hidden', '');
        li.classList.remove('b3-list-item--open');
        openSet.delete(hpath);
      }
      saveOpenState(openSet);
    });
  }

  // 移动端抽屉交互
  function initDrawer() {
    const sidebar = document.getElementById('oceanpress-left-sidebar');
    if (!sidebar) return;
    if (!window.matchMedia('(max-width: 768px)').matches) return;
    if (document.getElementById('oceanpress-sidebar-fab')) return;

    const fab = document.createElement('button');
    fab.id = 'oceanpress-sidebar-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', '打开目录');
    fab.innerHTML = ICONS.menu;
    fab.addEventListener('click', function (e) {
      e.stopPropagation();
      sidebar.classList.add('oceanpress-sidebar--visible');
      document.body.classList.add('oceanpress-drawer-open');
    });
    document.body.appendChild(fab);

    // 点击抽屉外区域关闭
    document.addEventListener('click', function (e) {
      if (sidebar.classList.contains('oceanpress-sidebar--visible') &&
          !sidebar.contains(e.target) && e.target !== fab && !fab.contains(e.target)) {
        sidebar.classList.remove('oceanpress-sidebar--visible');
        document.body.classList.remove('oceanpress-drawer-open');
      }
    });
  }

  // 暴露到全局
  window.OceanPressDocTree = {
    render: renderDocTree,
    data: docTreeData
  };

  // 自动渲染（如果容器存在），并为侧边栏插入标题栏
  function autoRender() {
    const sidebar = document.getElementById('oceanpress-left-sidebar');
    const container = document.getElementById('oceanpress-doctree');
    if (sidebar && !sidebar.querySelector('.oceanpress-dock-title')) {
      const title = document.createElement('div');
      title.className = 'oceanpress-dock-title';
      title.innerHTML = ICONS.title + '<span>目录</span>';
      sidebar.insertBefore(title, sidebar.firstChild);
    }
    if (container) {
      renderDocTree('oceanpress-doctree');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoRender);
  } else {
    autoRender();
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
