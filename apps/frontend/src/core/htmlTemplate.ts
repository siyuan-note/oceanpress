import type { SiteConfig } from './config.ts'
import { generateSeoContent } from './seo.ts'

/** 思源导出样式/脚本的缓存版本号 */
const version = '2.10.5'
/** 站点样式版本号，用作 site.css 的缓存 key；改动 site.css 后需要递增 */
const themeVersion = '16'

/** html 属性值转义 */
function attr(s: string | undefined) {
  return (s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
/** html 文本转义 */
function text(s: string | undefined) {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function htmlTemplate(
  p: {
    htmlContent: string
    title: string
    level: number
    seoData?: {
      doc: any
      config: any
      pageUrl: string
      breadcrumbs?: Array<{ name: string; url: string }>
    }
  },
  config?: {
    siyuanPrefix?: string
    publicZip?: string
    embedCode?: { head?: string; beforeBody?: string; afterBody?: string }
    site?: SiteConfig
  },
) {
  /** 根据页面层级返回相对的资源前缀 notebook/，资源随站点产物一起输出，站点因此不依赖 CDN；配置了 siyuanPrefix 则以配置为准 */
  const prePath = config?.siyuanPrefix ?? '../'.repeat(p.level) + 'notebook/'
  const site = config?.site
  const embed = config?.embedCode ?? {}
  const siteTitle = site?.title || 'Home'
  const seo = p.seoData
    ? generateSeoContent({
        doc: p.seoData.doc,
        config: p.seoData.config,
        pageUrl: p.seoData.pageUrl,
        content: p.htmlContent,
        breadcrumbs: p.seoData.breadcrumbs,
      })
    : { metaTags: '', jsonLd: '' }

  /** 站内相对链接：页头/页脚都是站点级配置，按根路径书写（/xxx），这里换算成相对当前文档的路径以兼容子目录部署与 file 协议 */
  const rootPrefix = p.level === 0 ? '.' : Array(p.level).fill('..').join('/')
  const siteUrl = (url: string) =>
    url.startsWith('/') ? `${rootPrefix}${url}` : url

  const brand = site
    ? `<a class="op-header__brand" href="${siteUrl('/')}">${
        site.logo
          ? `<img class="op-header__logo" src="${attr(site.logo)}" alt="" />`
          : `<span class="op-header__logo op-header__logo--text">${text(siteTitle.slice(0, 1))}</span>`
      }<span class="op-header__title">${text(siteTitle)}</span></a>`
    : ''

  const nav = site?.nav.length
    ? `<nav class="op-header__nav" aria-label="站点导航">${site.nav
        .map((n) => `<a href="${attr(siteUrl(n.url))}">${text(n.name)}</a>`)
        .join('')}</nav>`
    : ''

  /** algolia docsearch：样式放 head，脚本放 body 末尾 */
  const searchCss = site?.search.enable
    ? '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@docsearch/css@3" />'
    : ''
  const searchBox = site?.search.enable ? '<div id="op-search" class="op-search"></div>' : ''
  const searchJs = site?.search.enable
    ? `<script src="https://cdn.jsdelivr.net/npm/@docsearch/js@3"></script>
  <script>
    docsearch({ container: '#op-search', appId: ${JSON.stringify(site.search.appId)}, apiKey: ${JSON.stringify(site.search.apiKey)}, indexName: ${JSON.stringify(site.search.indexName)}, insights: true, debug: false });
  </script>`
    : ''

  /** giscus 评论：仅文章页显示（首页不显示） */
  const comments =
    site?.comments.enable && !p.title.endsWith('.rss')
      ? `<section class="op-comments"><script src="https://giscus.app/client.js"
        data-repo="${attr(site.comments.repo)}"
        data-repo-id="${attr(site.comments.repoId)}"
        data-category="${attr(site.comments.category)}"
        data-category-id="${attr(site.comments.categoryId)}"
        data-mapping="${attr(site.comments.mapping)}"
        data-strict="0"
        data-reactions-enabled="1"
        data-emit-metadata="0"
        data-input-position="top"
        data-theme="preferred_color_scheme"
        data-lang="${attr(site.comments.lang)}"
        data-loading="lazy"
        crossorigin="anonymous"
        async></script></section>`
      : ''

  const footer = site
    ? `<footer class="op-footer"><div class="op-footer__inner">${
        site.footer
          ? site.footer
          : `© ${new Date().getFullYear()} ${text(site.author || siteTitle)} · 由 <a href="https://github.com/2234839/oceanPress_js" target="_blank" rel="noopener">OceanPress</a> 从思源笔记生成`
      }</div></footer>`
    : ''

  return `<!DOCTYPE html>
<html lang="zh_CN" data-theme-mode="light">
<head>
  ${embed.head ?? ''}
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="generator" content="OceanPress" />
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#1b1b1f" media="(prefers-color-scheme: dark)" />
  ${seo.metaTags}
  <title>${text(p.title)}${site ? ` · ${text(siteTitle)}` : ''}</title>
  <script>
  // 前置主题探测：head 内联同步执行，在任何内容渲染前标好主题，避免暗色用户看到闪白
  (function () {
    var preferred = localStorage.getItem('oceanpress-theme');
    var dark = preferred === 'dark' || (preferred !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.setAttribute('data-theme-mode', 'dark');
  })();
  </script>
  <link rel="stylesheet" type="text/css" href="${prePath}appearance/site.css?v=${themeVersion}"/>
  ${searchCss}
  ${seo.jsonLd}
</head>
<body>
  ${embed.beforeBody ?? ''}
  <header class="op-header">
    <div class="op-header__inner">
      ${brand}
      ${nav}
      <div class="op-header__actions">
        ${searchBox}
        <button id="op-theme-toggle" class="op-icon-btn" type="button" aria-label="切换主题" title="切换主题"></button>
        <button id="op-menu-toggle" class="op-icon-btn op-header__menu" type="button" aria-label="打开目录" title="目录"></button>
      </div>
    </div>
  </header>
  ${p.htmlContent}
  ${comments}
  ${footer}
  <div id="op-lightbox" class="op-lightbox" hidden><button type="button" class="op-lightbox__close" aria-label="关闭">×</button><img alt="" /></div>
  <div id="op-progress" class="op-progress"></div>
  <script src="${prePath}appearance/icons/material/icon.js?${version}"></script>
  <script src="${prePath}stage/build/export/protyle-method.js?${version}"></script>
  <script src="${prePath}stage/protyle/js/lute/lute.min.js?${version}"></script>
  <script>
    window.siyuan = {
      config: {
        appearance: {
          mode: document.documentElement.getAttribute('data-theme-mode') === 'dark' ? 1 : 0,
          codeBlockThemeDark: "atom-one-dark",
          codeBlockThemeLight: "github",
        },
        editor: {
          codeLineWrap: true,
          codeLigatures: false,
          plantUMLServePath: "https://www.plantuml.com/plantuml/svg/~1",
          codeSyntaxHighlightLineNum: true,
          katexMacros: JSON.stringify({}),
        },
      },
      languages: { copy: "复制" },
    };
    const cdn = "${prePath}stage/protyle";
    const previewElement = document.getElementById("preview");
    Protyle.highlightRender(previewElement, cdn);
    Protyle.mathRender(previewElement, cdn, false);
    Protyle.mermaidRender(previewElement, cdn);
    Protyle.flowchartRender(previewElement, cdn);
    Protyle.graphvizRender(previewElement, cdn);
    Protyle.chartRender(previewElement, cdn);
    Protyle.mindmapRender(previewElement, cdn);
    Protyle.abcRender(previewElement, cdn);
    Protyle.htmlRender(previewElement);
    Protyle.plantumlRender(previewElement, cdn);
  </script>
  <script src="${prePath}appearance/main.js?v=${themeVersion}" defer></script>
  ${searchJs}
  ${embed.afterBody ?? ''}
</body>
</html>`
}
