import { generateSeoContent } from './seo.ts'

/** 添加对应的 html 模板 */
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
  ${
    p.seoData
      ? generateSeoContent({
          doc: p.seoData.doc,
          config: p.seoData.config,
          pageUrl: p.seoData.pageUrl,
          content: p.htmlContent,
          breadcrumbs: p.seoData.breadcrumbs,
        }).metaTags
      : ''
  }
  <link rel="stylesheet" type="text/css" id="baseStyle" href="${prePath}stage/build/export/base.css?${version}"/>
  <script>
  // 更好的主题切换方案
  (function() {
    // 主题配置
    const themes = {
      light: {
        name: 'daylight',
        mode: 'light',
        icon: '☀️'
      },
      dark: {
        name: 'midnight',
        mode: 'dark',
        icon: '🌙'
      },
      auto: {
        name: 'auto',
        mode: 'auto',
        icon: '🌗',
        getTheme: function() {
          const currentHour = new Date().getHours();
          return currentHour >= 18 || currentHour < 6 ? 'dark' : 'light';
        }
      }
    };

    // 获取当前主题设置
    function getCurrentTheme() {
      // 优先级：localStorage > 系统偏好 > auto
      const savedTheme = localStorage.getItem('oceanpress-theme');
      if (savedTheme && themes[savedTheme]) {
        return savedTheme;
      }

      // 检测系统偏好
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }

      return 'auto';
    }

    // 应用主题
    function applyTheme(themeName) {
      const theme = themes[themeName] || themes.auto;
      const actualTheme = themeName === 'auto' ? theme.getTheme() : themeName;
      const themeConfig = themes[actualTheme];

      // 设置 CSS 变量
      document.documentElement.setAttribute('data-theme-mode', themeConfig.mode);
      document.documentElement.setAttribute('data-light-theme', 'daylight');
      document.documentElement.setAttribute('data-dark-theme', 'midnight');

      // 加载对应的 CSS
      const themeStyle = document.getElementById('themeDefaultStyle');
      if (themeStyle) {
        themeStyle.href = '${prePath}appearance/themes/' + themeConfig.name + '/theme.css?${version}';
      } else {
        // 如果元素不存在，创建它
        const link = document.createElement('link');
        link.id = 'themeDefaultStyle';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = '${prePath}appearance/themes/' + themeConfig.name + '/theme.css?${version}';
        document.head.appendChild(link);
      }

      // 更新主题切换按钮
      updateThemeToggle(themeName);

      // 保存到 localStorage
      localStorage.setItem('oceanpress-theme', themeName);

      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('oceanpress-theme-changed', {
        detail: { theme: themeName, actualTheme: actualTheme }
      }));
    }

    // 创建主题切换按钮：优先挂在顶部导航（.header-container）里，与搜索按钮同排；
    // 没有导航时回退为 body 下的 fixed 悬浮按钮（配合 oceanpress.css 的 body > #oceanpress-theme-toggle）
    function createThemeToggle() {
      const toggle = document.createElement('div');
      toggle.id = 'oceanpress-theme-toggle';
      toggle.innerHTML = '<span class="theme-icon">🌗</span><span class="theme-text">自动</span>';
      toggle.addEventListener('click', toggleTheme);
      const header = document.querySelector('.header-container');
      if (header) {
        header.appendChild(toggle);
      } else {
        document.body.appendChild(toggle);
      }
    }

    // 更新主题切换按钮
    function updateThemeToggle(themeName) {
      const toggle = document.getElementById('oceanpress-theme-toggle');
      if (!toggle) return;

      const theme = themes[themeName] || themes.auto;
      toggle.innerHTML = '<span class="theme-icon">' + theme.icon + '</span><span class="theme-text">' +
        (themeName === 'auto' ? '自动' : (themeName === 'dark' ? '深色' : '浅色')) + '</span>';
    }

    // 切换主题
    function toggleTheme() {
      const currentTheme = getCurrentTheme();
      const themeOrder = ['auto', 'light', 'dark'];
      const currentIndex = themeOrder.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % themeOrder.length;
      const nextTheme = themeOrder[nextIndex];

      applyTheme(nextTheme);
    }

    // 监听系统主题变化
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const currentTheme = getCurrentTheme();
        if (currentTheme === 'auto') {
          applyTheme('auto');
        }
      });
    }

    // 监听自定义主题变化事件（用于侧边栏等组件）
    window.addEventListener('oceanpress-theme-changed', function(e) {
      // 这里可以添加其他组件需要响应主题变化的逻辑
      console.log('Theme changed to:', e.detail);
    });

    // 初始化主题
    function initTheme() {
      const themeName = getCurrentTheme();
      const theme = themes[themeName] || themes.auto;
      const actualTheme = themeName === 'auto' ? theme.getTheme() : themeName;
      const themeConfig = themes[actualTheme];

      // 立即设置基础主题，避免闪烁
      document.documentElement.setAttribute('data-theme-mode', themeConfig.mode);
      document.documentElement.setAttribute('data-light-theme', 'daylight');
      document.documentElement.setAttribute('data-dark-theme', 'midnight');

      // 创建主题切换按钮
      createThemeToggle();

      // 应用完整主题
      applyTheme(themeName);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initTheme);
    } else {
      initTheme();
    }
  })();
  </script>
  <link rel="stylesheet" type="text/css" href="${prePath}appearance/oceanpress.css"/>
  <title>${p.title}</title>
  ${
    p.seoData
      ? generateSeoContent({
          doc: p.seoData.doc,
          config: p.seoData.config,
          pageUrl: p.seoData.pageUrl,
          content: p.htmlContent,
          breadcrumbs: p.seoData.breadcrumbs,
        }).jsonLd
      : ''
  }
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
          mode: document.documentElement.getAttribute('data-theme-mode') === 'dark' ? 1 : 0,//主题 明亮=0 暗黑=1
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
