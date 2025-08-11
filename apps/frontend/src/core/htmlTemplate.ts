import { generateSeoContent } from './seo.ts'

/** 添加对应的 html 模板 */
export async function htmlTemplate(
  p: { 
    htmlContent: string; 
    title: string; 
    level: number;
    seoData?: {
      doc: any;
      config: any;
      pageUrl: string;
      breadcrumbs?: Array<{ name: string; url: string }>;
    }
  },
  config?: {
    siyuanPrefix: string
    embedCode?: { head?: string; beforeBody?: string; afterBody?: string }
  },
) {
  /** 根据level有几级返回多少个 '../' ,用于解决 file协议打开html文档无法正常加载资源 */
  let prePath = ''
  if (config?.siyuanPrefix) {
    prePath = config.siyuanPrefix
  } else {
    for (let i = 0; i < p.level; i++) {
      prePath += '../'
    }
  }
  const version = '2.10.5'
  /** 思源中导出 html 代码： https://github1s.com/siyuan-note/siyuan/blob/HEAD/app/src/protyle/export/index.ts#L652 */
  //data-theme-mode="dark" data-light-theme="daylight" data-dark-theme="midnight"
  return `<!DOCTYPE html>
<html lang="zh_CN" data-theme-mode="light" data-light-theme="daylight" data-dark-theme="midnight">
<head>
  ${config?.embedCode?.head ?? ''}
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black" />
  ${p.seoData ? generateSeoContent({
    doc: p.seoData.doc,
    config: p.seoData.config,
    pageUrl: p.seoData.pageUrl,
    content: p.htmlContent,
    breadcrumbs: p.seoData.breadcrumbs
  }).metaTags : ''}
  <link rel="stylesheet" type="text/css" id="baseStyle" href="${prePath}stage/build/export/base.css?${version}"/>
  <script>
  function isNightTime() {
    const currentHour = new Date().getHours();
    return currentHour >= 18 || currentHour < 6;
  }
  document.write('<link rel="stylesheet" type="text/css" id="themeDefaultStyle" href="${prePath}appearance/themes/'+(isNightTime()?'midnight':'daylight')+'/theme.css?${version}"/>');
  </script>
  <link rel="stylesheet" type="text/css" href="${prePath}appearance/oceanpress.css"/>
  <title>${p.title}</title>
  ${p.seoData ? generateSeoContent({
    doc: p.seoData.doc,
    config: p.seoData.config,
    pageUrl: p.seoData.pageUrl,
    content: p.htmlContent,
    breadcrumbs: p.seoData.breadcrumbs
  }).jsonLd : ''}
</head>
<body>
  ${config?.embedCode?.beforeBody ?? ''}
  ${p.htmlContent}
  <script src="${prePath}appearance/icons/material/icon.js?${version}"></script>
  <script src="${prePath}stage/build/export/protyle-method.js?${version}"></script>
  <script src="${prePath}stage/protyle/js/lute/lute.min.js?${version}"></script>
  <script>
    window.siyuan = {
      config: {
        appearance: {
          mode: isNightTime()?1:0,//主题 明亮=0 暗黑=1
          codeBlockThemeDark: "base16/dracula",
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
    document.querySelectorAll(".protyle-action__copy").forEach((item) => {
      item.addEventListener("click", (event) => {
        navigator.clipboard.writeText(
          item.parentElement.nextElementSibling.textContent.trimEnd(),
        );
        event.preventDefault();
        event.stopPropagation();
      });
    });
  </script>
  ${config?.embedCode?.afterBody ?? ''}
</body>
</html>`
}
