// OceanPress 站点交互层：主题切换、移动端抽屉、阅读进度、目录高亮、代码复制、图片灯箱、标题锚点、行内目录
(function () {
  'use strict';

  var STORAGE_THEME = 'oceanpress-theme';
  var ICON = {
    sun: '<svg viewBox="0 0 32 32"><path d="M16 11.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 7a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm0-12.5a1 1 0 0 1 1 1V9a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm0 17a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1ZM4 15a1 1 0 0 1 0 2H2a1 1 0 1 1 0-2h2Zm26 0a1 1 0 0 1 0 2h-2a1 1 0 1 1 0-2h2ZM8.2 6.8a1 1 0 0 1 0 1.4L6.8 9.6A1 1 0 1 1 5.4 8.2l1.4-1.4a1 1 0 0 1 1.4 0Zm18.4 18.4a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0Zm0-18.4 1.4 1.4a1 1 0 1 1-1.4 1.4l-1.4-1.4a1 1 0 0 1 1.4-1.4ZM6.8 22.4a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0Z"/></svg>',
    moon: '<svg viewBox="0 0 32 32"><path d="M13.5 4.5a1 1 0 0 0-1.3-1.2A13 13 0 1 0 28.7 19.8a1 1 0 0 0-1.2-1.3A9.5 9.5 0 0 1 13.5 4.5Zm-2.1 1.6A11.5 11.5 0 0 0 25.9 20.6a11 11 0 1 1-14.5-14.5Z"/></svg>',
    menu: '<svg viewBox="0 0 32 32"><path d="M6 9h20a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2Zm0 6h20a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2Zm0 6h20a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2Z"/></svg>',
    up: '<svg viewBox="0 0 32 32"><path d="M16 8a1 1 0 0 1 .7.3l8 8a1 1 0 0 1-1.4 1.4L17 11.4V25a1 1 0 1 1-2 0V11.4l-6.3 6.3a1 1 0 0 1-1.4-1.4l8-8A1 1 0 0 1 16 8Z"/></svg>',
    link: '<svg viewBox="0 0 32 32"><path d="M13 6a7 7 0 0 0-5.5 11.3l2.4-2.4A3.5 3.5 0 1 1 15 9.9l3.5-3.5A7 7 0 0 0 13 6Zm6 20a7 7 0 0 0 5.5-11.3l-2.4 2.4A3.5 3.5 0 1 1 17 22.1l-3.5 3.5A7 7 0 0 0 19 26Z"/></svg>'
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function systemDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /* ---------- 主题 ---------- */
  function initTheme() {
    var btn = $('#op-theme-toggle');
    var root = document.documentElement;
    function current() { return localStorage.getItem(STORAGE_THEME) || 'auto'; }
    function apply(mode) {
      var dark = mode === 'dark' || (mode === 'auto' && systemDark());
      root.setAttribute('data-theme-mode', dark ? 'dark' : 'light');
      var link = document.getElementById('themeDefaultStyle');
      if (link) link.href = link.href.replace(/themes\/(daylight|midnight)\//, 'themes/' + (dark ? 'midnight' : 'daylight') + '/');
      if (btn) btn.innerHTML = dark ? ICON.sun : ICON.moon;
      root.style.colorScheme = dark ? 'dark' : 'light';
    }
    if (btn) {
      apply(current());
      btn.addEventListener('click', function () {
        var next = current() === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_THEME, next);
        apply(next);
      });
    }
    var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (current() === 'auto') apply('auto'); });
  }

  /* ---------- 移动端抽屉 ---------- */
  function initDrawer() {
    var btn = $('#op-menu-toggle');
    var sidebar = $('#oceanpress-left-sidebar');
    if (btn) btn.innerHTML = ICON.menu;
    if (!btn || !sidebar) return;
    var mask = null;
    function close() {
      sidebar.classList.remove('op-sidebar--visible');
      document.body.classList.remove('op-drawer-open');
      if (mask) { mask.remove(); mask = null; }
      btn.setAttribute('aria-expanded', 'false');
    }
    function open() {
      sidebar.classList.add('op-sidebar--visible');
      document.body.classList.add('op-drawer-open');
      mask = document.createElement('div');
      mask.className = 'op-drawer-mask';
      mask.addEventListener('click', close);
      document.body.appendChild(mask);
      btn.setAttribute('aria-expanded', 'true');
    }
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'oceanpress-left-sidebar');
    btn.addEventListener('click', function () {
      sidebar.classList.contains('op-sidebar--visible') ? close() : open();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) close(); });
    sidebar.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  }

  /* ---------- 阅读进度 / 回到顶部 ---------- */
  function initScroll() {
    var progress = $('#op-progress');
    var backtop = document.createElement('button');
    backtop.id = 'op-backtop';
    backtop.type = 'button';
    backtop.className = 'op-icon-btn';
    backtop.setAttribute('aria-label', '回到顶部');
    backtop.innerHTML = ICON.up;
    document.body.appendChild(backtop);
    var ticking = false;
    function update() {
      ticking = false;
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var y = h.scrollTop || document.body.scrollTop;
      if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      backtop.classList.toggle('is-visible', y > 400);
      highlightToc();
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    backtop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- 标题锚点 ---------- */
  function initAnchors() {
    var body = $('.op-doc-body');
    if (!body) return;
    $all('[data-type="NodeHeading"]', body).forEach(function (h) {
      var id = h.getAttribute('data-node-id');
      if (!id) return;
      var a = document.createElement('a');
      a.className = 'op-anchor';
      a.href = '#' + id;
      a.setAttribute('aria-label', '锚点');
      a.innerHTML = ICON.link;
      h.insertBefore(a, h.firstChild);
    });
  }

  /* ---------- 目录高亮（右侧栏 + 行内目录） ---------- */
  var tocLinks = [];
  function highlightToc() {
    if (!tocLinks.length) return;
    var offset = (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--op-header-h'), 10) || 60) + 24;
    var current = '';
    for (var i = 0; i < tocLinks.length; i++) {
      var target = document.getElementById(tocLinks[i].getAttribute('data-target'));
      if (target && target.getBoundingClientRect().top - offset <= 0) current = tocLinks[i].getAttribute('data-target');
    }
    tocLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-target') === current); });
  }
  function initToc() {
    $all('.op-toc__item, .op-toc-inline__body a').forEach(function (a) {
      var id = (a.getAttribute('href') || '').slice(1);
      if (!id || !document.getElementById(id)) return;
      a.setAttribute('data-target', id);
      tocLinks.push(a);
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var t = document.getElementById(id);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + id);
      });
    });
    highlightToc();
  }
  /** 思源"目录"块：按当前文档标题在浏览器端生成 */
  function initInlineToc() {
    var box = $('.op-toc-inline__body');
    if (!box) return;
    var article = box.closest('.op-doc');
    if (!article) return;
    var hs = $all('[data-type="NodeHeading"]', article).filter(function (h) {
      return h.getAttribute('data-subtype') !== 'h1' && !h.closest('.op-embed') && !h.closest('.op-toc-inline');
    });
    box.innerHTML = hs.map(function (h) {
      var lv = parseInt(h.getAttribute('data-subtype') === 'h1' ? '1' : h.tagName.slice(1), 10) - 2;
      return '<a data-level="' + Math.max(0, lv) + '" href="#' + h.getAttribute('data-node-id') + '">' + h.textContent.replace(/#$/, '').trim() + '</a>';
    }).join('');
    if (!hs.length) box.closest('.op-toc-inline').style.display = 'none';
  }

  /* ---------- 代码复制 ---------- */
  function initCopy() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.protyle-action__copy');
      if (!btn) return;
      var code = btn.closest('.code-block');
      var text = code ? (code.querySelector('.hljs') || {}).textContent || '' : '';
      navigator.clipboard && navigator.clipboard.writeText(text).then(function () {
        btn.classList.add('is-copied');
        setTimeout(function () { btn.classList.remove('is-copied'); }, 1500);
      });
    });
  }

  /* ---------- 图片灯箱 ---------- */
  function initLightbox() {
    var box = $('#op-lightbox');
    if (!box) return;
    var img = box.querySelector('img');
    var content = $('#preview');
    if (!content) return;
    content.addEventListener('click', function (e) {
      var t = e.target;
      if (t.tagName !== 'IMG' || t.closest('.op-lightbox') || t.closest('.img-title')) return;
      var src = t.getAttribute('data-src') || t.src;
      if (!src) return;
      img.src = src;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
    });
    function close() { box.hidden = true; img.src = ''; document.body.style.overflow = ''; }
    box.addEventListener('click', close);
    box.querySelector('.op-lightbox__close').addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close(); });
  }

  /* ---------- 外链在嵌入块内不跳出 top ---------- */
  function initEmbedLinks() {
    $all('.op-embed a[target="_top"]').forEach(function (a) { a.removeAttribute('target'); });
  }

  /* ---------- iframe 自适应 ----------
   * 笔记里拖拽出的 iframe 带内联宽高；宽度超过正文时被样式表限制，这里让高度按同样比例缩放 */
  function fitIframes() {
    $all('.iframe iframe').forEach(function (f) {
      var box = f.parentElement;
      if (!box) return;
      if (!f.dataset.ow) {
        f.dataset.ow = parseFloat(f.style.width) || '';
        f.dataset.oh = parseFloat(f.style.height) || '';
      }
      var w = parseFloat(f.dataset.ow);
      var h = parseFloat(f.dataset.oh);
      if (!w || !h) return;
      f.style.height = Math.round(h * Math.min(1, box.clientWidth / w)) + 'px';
    });
  }
  var fitIframesPending = false;
  function fitIframesOnResize() {
    if (fitIframesPending) return;
    fitIframesPending = true;
    requestAnimationFrame(function () {
      fitIframesPending = false;
      fitIframes();
    });
  }

  /* ---------- 思维导图 ----------
   * 构建期只输出树形数据（data-mindmap），这里按思源原生导图的样式绘制：
   * 列表第一项是中心主题，在最左侧；所有层级只向右展开，节点是纯文字无外框，
   * 浅灰曲线连接，点带子节点的节点可折叠子树 */
  var MM = {
    /* 与思源一致：节点高、同级纵向间距、层级水平间距、画布留白 */
    nodeH: 30, padY: 16, gapX: 40, pad: 32,
    /* 节点左右内边距 */
    padX: 6,
    /* 连线：取主题边框色，线宽与思源一致 */
    linkColor: 'var(--op-border)', linkW: 1.5,
    font: 14,
    /* 空节点占位文字 */
    placeholder: '输入文字',
  };
  var MM_NS = 'http://www.w3.org/2000/svg';

  function mmSvg(tag, attrs) {
    var el = document.createElementNS(MM_NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  /** 节点文字宽度估算：CJK 按 1em，其余按 0.56em，不依赖字体加载时序 */
  function mmTextW(text) {
    var w = 0;
    for (var i = 0; i < text.length; i++) w += text.charCodeAt(i) > 255 ? MM.font : MM.font * 0.56;
    return Math.ceil(w);
  }

  function drawMindmap(box) {
    var root;
    try { root = JSON.parse(box.dataset.mindmap); } catch (e) { return; }
    var svg = mmSvg('svg', { role: 'img', class: 'op-mindmap__svg' });
    box.textContent = '';
    box.appendChild(svg);

    /** 拍平：parentOf 查父，byId 按点到的节点 id 取节点 */
    var parentOf = {};
    var byId = {};
    (function index(node, parent) {
      byId[node.id] = node;
      parentOf[node.id] = parent;
      for (var i = 0; i < node.children.length; i++) index(node.children[i], node);
    })(root, null);
    (function markDepth(node, depth) {
      node.depth = depth;
      for (var i = 0; i < node.children.length; i++) markDepth(node.children[i], depth + 1);
    })(root, 0);
    for (var id in byId) {
      var text = byId[id].text || MM.placeholder;
      byId[id].w = mmTextW(text);
    }

    var collapsed = {};

    /** node 是否被某个已折叠的祖先遮住 */
    function hidden(node) {
      for (var cur = parentOf[node.id]; cur; cur = parentOf[cur.id]) {
        if (collapsed[cur.id]) return true;
      }
      return false;
    }
    function kids(node) {
      return node.children.filter(function (c) { return !hidden(c); });
    }

    /** 节点盒子：尺寸按思源的节点内边距估算，宽 = 文字宽 + 左右内边距 */
    function boxOf(node) {
      return { x: 0, y: 0, width: node.w + MM.padX * 2, height: MM.nodeH };
    }

    /** 布局，与思源 layoutListMindmap 一致：
     * 子树高 = max(节点高, 子节点高之和 + 间距)，节点在子树内垂直居中，x = 父.x + 父.w + 水平间距 */
    function layout() {
      var boxes = {};
      var heights = {};
      var edges = [];
      /** 后序遍历：先算子节点 */
      function visit(node, parentId) {
        var ks = kids(node);
        var childHeight = 0;
        ks.forEach(function (k, i) {
          visit(k, node.id);
          if (i) childHeight += MM.padY;
          childHeight += heights[k.id];
          edges.push({ from: node.id, to: k.id });
        });
        heights[node.id] = Math.max(MM.nodeH, childHeight);
        boxes[node.id] = boxOf(node);
        boxes[node.id].parentId = parentId;
      }
      visit(root, null);
      var tops = {};
      tops[root.id] = MM.pad;
      /** 前序放置 */
      (function place(node) {
        var box = boxes[node.id];
        var top = tops[node.id];
        var parent = box.parentId ? boxes[box.parentId] : null;
        box.x = parent ? parent.x + parent.width + MM.gapX : MM.pad;
        box.y = top + (heights[node.id] - box.height) / 2;
        var ks = kids(node);
        var childHeight = ks.reduce(function (s, k, i) { return s + (i ? MM.padY : 0) + heights[k.id]; }, 0);
        var childTop = top + (heights[node.id] - childHeight) / 2;
        ks.forEach(function (k, i) {
          if (i) childTop += MM.padY;
          tops[k.id] = childTop;
          childTop += heights[k.id];
        });
        ks.forEach(place);
      })(root);
      return { boxes: boxes, edges: edges, width: MM.pad, height: heights[root.id] + MM.pad * 2 };
    }

    /** 连线锚点的 y：中心主题与一级分支取中线，更深层取底边（思源的 underline 形状） */
    function anchorY(box, depth) {
      return box.y + (depth <= 1 ? box.height / 2 : box.height);
    }

    function draw() {
      var lay = layout();
      var boxes = lay.boxes;
      var width = 0;
      Object.keys(boxes).forEach(function (id) { width = Math.max(width, boxes[id].x + boxes[id].width); });
      lay.width = width + MM.pad;
      svg.setAttribute('viewBox', '0 0 ' + lay.width + ' ' + lay.height);
      svg.setAttribute('width', lay.width);
      svg.setAttribute('height', lay.height);

      svg.textContent = '';
      var gLinks = mmSvg('g', { fill: 'none', stroke: MM.linkColor, 'stroke-width': MM.linkW, 'stroke-linecap': 'butt', 'stroke-linejoin': 'round' });
      var gNodes = mmSvg('g', {});
      svg.appendChild(gLinks);
      svg.appendChild(gNodes);

      /** 连线，与思源 buildListMindmapConnectors 的 spline 一致：
       * 从父节点右边缘水平切出，用三阶贝塞尔弯到子节点锚点，再沿锚点画到子节点右边缘（下划线） */
      lay.edges.forEach(function (edge) {
        var from = boxes[edge.from], to = boxes[edge.to];
        var depth = to.depth;
        var startX = from.x + from.width, startY = anchorY(from, from.depth);
        var endY = anchorY(to, depth);
        var center = (startX + to.x) / 2;
        var d = 'M' + startX + ',' + startY + ' C' + startX + ',' + startY + ' ' + center + ',' + endY + ' ' + to.x + ',' + endY;
        if (depth > 1) d += ' L' + (to.x + to.width) + ',' + endY;
        gLinks.appendChild(mmSvg('path', { d: d }));
      });
      Object.keys(boxes).forEach(function (id) {
        var box = boxes[id];
        var node = byId[id];
        var isRoot = !parentOf[id];
        var hasKids = node.children.length > 0;
        var g = mmSvg('g', {
          class: 'op-mindmap__node' + (isRoot ? ' is-root' : '') + (hasKids ? ' has-children' : '') + (collapsed[id] ? ' is-collapsed' : '') + (node.text ? '' : ' is-empty'),
        });
        g.dataset.id = id;
        /* 折叠标记只在折叠后出现，位置就在被收起的子节点那一侧 */
        if (collapsed[id]) {
          g.appendChild(mmSvg('circle', { cx: box.x + box.width + MM.gapX / 2, cy: box.y + box.height / 2, r: 8, class: 'op-mindmap__toggle' }));
          g.appendChild(mmSvg('text', { x: box.x + box.width + MM.gapX / 2, y: box.y + box.height / 2 + 4, class: 'op-mindmap__toggle-sign', 'text-anchor': 'middle' }));
          g.lastChild.textContent = '+';
        }
        var t = mmSvg('text', { x: box.x + MM.padX, y: box.y + box.height / 2 + 5, 'text-anchor': 'start' });
        t.textContent = node.text || MM.placeholder;
        g.appendChild(t);
        gNodes.appendChild(g);
      });
    }

    draw();
    svg.addEventListener('click', function (e) {
      var g = e.target.closest('.op-mindmap__node');
      if (!g) return;
      var node = byId[g.dataset.id];
      if (!node || !node.children.length || !parentOf[node.id]) return;
      collapsed[node.id] = !collapsed[node.id];
      draw();
    });
  }

  function initMindmaps() {
    $all('[data-mindmap]').forEach(drawMindmap);
  }

  /** 页签块：点击切换激活项；未执行到脚本时所有页签平铺展示，不丢内容 */
  function initTabs() {
    for (const box of document.querySelectorAll('.op-tabs')) {
      box.classList.add('op-tabs--js');
      const activate = (id) => {
        box.dataset.activeId = id;
        for (const btn of box.querySelectorAll('.op-tabs__btn')) {
          const on = btn.dataset.tabId === id;
          btn.classList.toggle('is-active', on);
          btn.setAttribute('aria-selected', on ? 'true' : 'false');
        }
        for (const panel of box.querySelectorAll('.op-tab')) {
          panel.classList.toggle('is-active', panel.id === id);
        }
      };
      activate(box.dataset.activeId || box.querySelector('.op-tab')?.id);
      for (const btn of box.querySelectorAll('.op-tabs__btn')) {
        btn.addEventListener('click', () => activate(btn.dataset.tabId));
      }
    }
  }

  function boot() {
    initTheme();
    initDrawer();
    initScroll();
    initAnchors();
    initToc();
    initInlineToc();
    initCopy();
    initLightbox();
    initEmbedLinks();
    initTabs();
    initMindmaps();
    fitIframes();
    window.addEventListener('resize', fitIframesOnResize);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
