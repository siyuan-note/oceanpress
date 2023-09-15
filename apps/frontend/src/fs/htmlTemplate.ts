export function htmlTemplate(p: { html: string; title: string; level: number }) {
  /** 根据level有几级返回多少个 '../' ,用于解决 file协议打开html文档无法征程 */
  let prePath = "";
  for (let i = 0; i < p.level; i++) {
    prePath += "../";
  }

  return `<!DOCTYPE html>
    <html lang="zh_CN" data-theme-mode="light" data-light-theme="daylight" data-dark-theme="midnight">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black">
        <link rel="stylesheet" type="text/css" id="baseStyle" href="${prePath}stage/build/export/base.css?2.10.2"/>
        <link rel="stylesheet" type="text/css" id="themeDefaultStyle" href="${prePath}appearance/themes/daylight/theme.css?2.10.2"/>

        <title>${p.title}</title>
        <style>
            body {background-color: var(--b3-theme-background);color: var(--b3-theme-on-background)}
            .b3-typography, .protyle-wysiwyg, .protyle-title {font-size:16px !important}
            .b3-typography code:not(.hljs), .protyle-wysiwyg span[data-type~=code] { font-variant-ligatures: none }
            .li > .protyle-action {height:34px;line-height: 34px}
            .protyle-wysiwyg [data-node-id].li > .protyle-action ~ .h1, .protyle-wysiwyg [data-node-id].li > .protyle-action ~ .h2, .protyle-wysiwyg [data-node-id].li > .protyle-action ~ .h3, .protyle-wysiwyg [data-node-id].li > .protyle-action ~ .h4, .protyle-wysiwyg [data-node-id].li > .protyle-action ~ .h5, .protyle-wysiwyg [data-node-id].li > .protyle-action ~ .h6 {line-height:34px;}
            .protyle-wysiwyg [data-node-id].li > .protyle-action:after {height: 16px;width: 16px;margin:-8px 0 0 -8px}
            .protyle-wysiwyg [data-node-id].li > .protyle-action svg {height: 14px}
            .protyle-wysiwyg [data-node-id].li:before {height: calc(100% - 34px);top:34px}
            .protyle-wysiwyg [data-node-id] [spellcheck] {min-height:26px;}
            .protyle-wysiwyg [data-node-id] {}
            .protyle-wysiwyg .li {min-height:34px}
            .protyle-gutters button svg {height:26px}
            .protyle-wysiwyg img.emoji, .b3-typography img.emoji {width:18px}
            .protyle-wysiwyg .h1 img.emoji, .b3-typography h1 img.emoji {width:35px}
            .protyle-wysiwyg .h2 img.emoji, .b3-typography h2 img.emoji {width:31px}
            .protyle-wysiwyg .h3 img.emoji, .b3-typography h3 img.emoji {width:27px}
            .protyle-wysiwyg .h4 img.emoji, .b3-typography h4 img.emoji {width:25px}
            .protyle-wysiwyg .h5 img.emoji, .b3-typography h5 img.emoji {width:22px}
            .protyle-wysiwyg .h6 img.emoji, .b3-typography h6 img.emoji {width:20px}
        </style>
    </head>
    <body>
    <div class="protyle-wysiwyg protyle-wysiwyg--attr" style="max-width: 800px;margin: 0 auto;" id="preview">

    ${p.html}

    </div>
    <script src="${prePath}appearance/icons/material/icon.js?2.10.2"></script>
    <script src="${prePath}stage/build/export/protyle-method.js?2.10.2"></script>
    <script src="${prePath}stage/protyle/js/lute/lute.min.js?2.10.2"></script>
    <script>
        window.siyuan = {
          config: {
            appearance: { mode: 0, codeBlockThemeDark: "base16/dracula", codeBlockThemeLight: "github" },
            editor: {
              codeLineWrap: true,
              codeLigatures: false,
              plantUMLServePath: "https://www.plantuml.com/plantuml/svg/~1",
              codeSyntaxHighlightLineNum: true,
              katexMacros: JSON.stringify({}),
            }
          },
          languages: {copy:"复制"}
        };
        const previewElement = document.getElementById('preview');
        Protyle.highlightRender(previewElement, "stage/protyle");
        Protyle.mathRender(previewElement, "stage/protyle", false);
        Protyle.mermaidRender(previewElement, "stage/protyle");
        Protyle.flowchartRender(previewElement, "stage/protyle");
        Protyle.graphvizRender(previewElement, "stage/protyle");
        Protyle.chartRender(previewElement, "stage/protyle");
        Protyle.mindmapRender(previewElement, "stage/protyle");
        Protyle.abcRender(previewElement, "stage/protyle");
        Protyle.htmlRender(previewElement);
        Protyle.plantumlRender(previewElement, "stage/protyle");
        document.querySelectorAll(".protyle-action__copy").forEach((item) => {
          item.addEventListener("click", (event) => {
                navigator.clipboard.writeText(item.parentElement.nextElementSibling.textContent.trimEnd());
                event.preventDefault();
                event.stopPropagation();
          })
        });
    </script></body></html>`;
}
