export async function htmlTemplate(
  p: { htmlContent: string; title: string; level: number },
  config?: {
    siyuanPrefix: string;
    embedCode?: { head?: string; beforeBody?: string; afterBody?: string };
  },
) {
  /** 根据level有几级返回多少个 '../' ,用于解决 file协议打开html文档无法正常加载资源 */
  let prePath = "";
  if (config?.siyuanPrefix) {
    prePath = config.siyuanPrefix;
  } else {
    for (let i = 0; i < p.level; i++) {
      prePath += "../";
    }
  }
  const version = "2.10.5";
  return `<!DOCTYPE html>
<html
  lang="zh_CN"
  data-theme-mode="light"
  data-light-theme="daylight"
  data-dark-theme="midnight"
>
  <head>
    ${config?.embedCode?.head ?? ""}
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <link rel="stylesheet" type="text/css" id="baseStyle" href="${prePath}stage/build/export/base.css?${version}"/>
    <link rel="stylesheet" type="text/css" id="themeDefaultStyle" href="${prePath}appearance/themes/daylight/theme.css?${version}"/>
    <link rel="stylesheet" type="text/css" href="${prePath}appearance/oceanpress.css"/>
    <title>${p.title}</title>
  </head>
  <body>
    ${config?.embedCode?.beforeBody ?? ""}
    <div
      class="protyle-wysiwyg protyle-wysiwyg--attr"
      style="max-width: 800px;margin: 0 auto;"
      id="preview"
    >
      ${p.htmlContent}
    </div>
    <script src="${prePath}appearance/icons/material/icon.js?${version}"></script>
    <script src="${prePath}stage/build/export/protyle-method.js?${version}"></script>
    <script src="${prePath}stage/protyle/js/lute/lute.min.js?${version}"></script>
    <script>
      window.siyuan = {
        config: {
          appearance: {
            mode: 0,
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
      const previewElement = document.getElementById("preview");
      Protyle.highlightRender(previewElement, "${prePath}stage/protyle");
      Protyle.mathRender(previewElement, "${prePath}stage/protyle", false);
      Protyle.mermaidRender(previewElement, "${prePath}stage/protyle");
      Protyle.flowchartRender(previewElement, "${prePath}stage/protyle");
      Protyle.graphvizRender(previewElement, "${prePath}stage/protyle");
      Protyle.chartRender(previewElement, "${prePath}stage/protyle");
      Protyle.mindmapRender(previewElement, "${prePath}stage/protyle");
      Protyle.abcRender(previewElement, "${prePath}stage/protyle");
      Protyle.htmlRender(previewElement);
      Protyle.plantumlRender(previewElement, "${prePath}stage/protyle");
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
    ${config?.embedCode?.afterBody ?? ""}
  </body>
</html>`;
}
