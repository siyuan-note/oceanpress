// OceanPress 站点交互层：主题切换、移动端抽屉、阅读进度、目录高亮、代码复制、图片灯箱、标题锚点、行内目录
(function () {
  'use strict';

  var STORAGE_THEME = 'oceanpress-theme';
  /** 三态循环顺序：明亮 → 暗夜 → 系统 */
  var THEME_ORDER = ['light', 'dark', 'auto'];
  var THEME_LABEL = { light: '明亮', dark: '暗夜', auto: '系统' };
  var ICON = {
    sun: '<svg viewBox="0 0 32 32"><path d="M16 11.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 7a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Zm0-12.5a1 1 0 0 1 1 1V9a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm0 17a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1ZM4 15a1 1 0 0 1 0 2H2a1 1 0 1 1 0-2h2Zm26 0a1 1 0 0 1 0 2h-2a1 1 0 1 1 0-2h2ZM8.2 6.8a1 1 0 0 1 0 1.4L6.8 9.6A1 1 0 1 1 5.4 8.2l1.4-1.4a1 1 0 0 1 1.4 0Zm18.4 18.4a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0Zm0-18.4 1.4 1.4a1 1 0 1 1-1.4 1.4l-1.4-1.4a1 1 0 0 1 1.4-1.4ZM6.8 22.4a1 1 0 0 1 0 1.4l-1.4 1.4a1 1 0 0 1-1.4-1.4l1.4-1.4a1 1 0 0 1 1.4 0Z"/></svg>',
    moon: '<svg viewBox="0 0 32 32"><path d="M13.5 4.5a1 1 0 0 0-1.3-1.2A13 13 0 1 0 28.7 19.8a1 1 0 0 0-1.2-1.3A9.5 9.5 0 0 1 13.5 4.5Zm-2.1 1.6A11.5 11.5 0 0 0 25.9 20.6a11 11 0 1 1-14.5-14.5Z"/></svg>',
    auto: '<svg viewBox="0 0 32 32"><path d="M6 6h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-8v3h3a1 1 0 1 1 0 2H11a1 1 0 1 1 0-2h3v-3H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 2v12h20V8Z"/></svg>',
    menu: '<svg viewBox="0 0 32 32"><path d="M6 9h20a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2Zm0 6h20a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2Zm0 6h20a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2Z"/></svg>',
    up: '<svg viewBox="0 0 32 32"><path d="M16 8a1 1 0 0 1 .7.3l8 8a1 1 0 0 1-1.4 1.4L17 11.4V25a1 1 0 1 1-2 0V11.4l-6.3 6.3a1 1 0 0 1-1.4-1.4l8-8A1 1 0 0 1 16 8Z"/></svg>',
    link: '<svg viewBox="0 0 32 32"><path d="M13 6a7 7 0 0 0-5.5 11.3l2.4-2.4A3.5 3.5 0 1 1 15 9.9l3.5-3.5A7 7 0 0 0 13 6Zm6 20a7 7 0 0 0 5.5-11.3l-2.4 2.4A3.5 3.5 0 1 1 17 22.1l-3.5 3.5A7 7 0 0 0 19 26Z"/></svg>'
  };
  /** 三态各自显示的图标：明亮 = 太阳，暗夜 = 月亮，系统 = 显示器 */
  var THEME_ICON = { light: ICON.sun, dark: ICON.moon, auto: ICON.auto };

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
      root.dataset.theme = mode;
      if (btn) {
        btn.innerHTML = THEME_ICON[mode] + '<span class="op-icon-btn__label">' + THEME_LABEL[mode] + '</span>';
        btn.title = '主题：' + THEME_LABEL[mode] + '（点击切换）';
        btn.setAttribute('aria-label', btn.title);
      }
      root.style.colorScheme = dark ? 'dark' : 'light';
    }
    if (btn) {
      apply(current());
      btn.addEventListener('click', function () {
        var next = THEME_ORDER[(THEME_ORDER.indexOf(current()) + 1) % THEME_ORDER.length];
        localStorage.setItem(STORAGE_THEME, next);
        apply(next);
      });
    }
    var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (current() === 'auto') apply('auto'); });
  }

  /* ---------- 水墨字 ---------- */
  /** 取标题首个非空白、非 emoji 符号的字符，作为文章头右侧的淡墨大字 */
  function initInkWatermark() {
    var header = $('.op-doc-header');
    var title = header && $('.op-doc-header__title', header);
    if (!title) return;
    var chars = Array.from(title.textContent.trim());
    var first = chars.find(function (ch) { return !/\s|\p{Extended_Pictographic}/u.test(ch); });
    if (first) header.setAttribute('data-ink', first);
  }

  /* ---------- 水墨画卷：随水而动的虾 ---------- */
  /**
   * 一只虾 = 若干笔，按齐白石虾的结构从后往前叠：
   * 尾扇 → 腹节（六节，由胸至尾逐节变细、变淡，沿一条弧线向后上方翘起）
   * → 头胸甲（最小、最浓的一块）→ 足、螯、须（线）。
   * 画布 300×170，头朝左。虾身中部略向上弓。
   */
  var SHRIMP_VIEWBOX = '-90 -30 300 170';

  /**
   * 腹节：自胸至尾。每节是一个四边形笔触：
   *   x0 为节的前端接点，x1 为后端接点；y0 / y1 为对应的中线高度；h0 / h1 为对应粗细。
   * 节的前端比上一节的后端略宽并相互重叠，于是前一节压住后一节，形成分节。
   * y 沿弧线升高，虾身由此向后上方翘起。
   */
  var SHRIMP_BODY = [
    { x0: 78, y0: 61, x1: 104, y1: 58, h0: 22, h1: 20, o: 0.5 },
    { x0: 100, y0: 58, x1: 126, y1: 51, h0: 21, h1: 17, o: 0.44 },
    { x0: 122, y0: 51, x1: 146, y1: 44, h0: 18, h1: 14, o: 0.38 },
    { x0: 142, y0: 44, x1: 164, y1: 39, h0: 15, h1: 11, o: 0.32 },
    { x0: 160, y0: 39, x1: 180, y1: 35, h0: 12, h1: 9, o: 0.27 },
    { x0: 176, y0: 35, x1: 192, y1: 33, h0: 10, h1: 7, o: 0.23 }
  ];
  /** 尾扇：三片，自尾节向后展开。中片最长，上下两片对称略短 */
  var SHRIMP_TAIL = [
    { d: 'M190 33 C200 23 214 13 234 11 C224 21 216 29 206 35Z', o: 0.34 },
    { d: 'M190 33 C204 29 220 31 240 39 C224 45 210 45 200 41Z', o: 0.24 },
    { d: 'M190 34 C200 41 208 51 212 67 C202 59 194 49 188 40Z', o: 0.3 }
  ];
  /** 步足：五对，每条两段（基节粗、末节细），从腹部伸向下方 */
  var SHRIMP_LEGS = [
    'M92 75 Q90 88 84 100 M84 100 L80 107',
    'M104 71 Q104 86 100 98 M100 98 L96 105',
    'M116 65 Q118 80 116 92 M116 92 L112 99',
    'M128 59 Q133 72 132 84 M132 84 L128 91',
    'M140 54 Q146 66 148 77 M148 77 L145 84'
  ];
  /** 螯：两对前伸的钳，第一对长、第二对短 */
  var SHRIMP_CLAWS = [
    'M62 62 Q46 56 36 48 M36 48 Q26 40 16 38 M17 38 L11 34 M17 38 L13 43',
    'M60 70 Q46 74 38 80 M38 80 Q30 86 22 88 M23 88 L18 84 M23 88 L20 94'
  ];
  /**
   * 每只虾的落位与个性。x / y 为视口比例，size 为体长像素，
   * dash 为每一拍的冲力（px/s），turn 为拍动时的转向灵敏度。
   */
  var SHRIMPS = [
    { x: 0.2, y: 0.3, size: 170, dash: 150, turn: 1.4 },
    { x: 0.82, y: 0.45, size: 130, dash: 190, turn: 2.2 },
    { x: 0.12, y: 0.78, size: 115, dash: 170, turn: 2.6 },
    { x: 0.78, y: 0.82, size: 185, dash: 120, turn: 1.1 },
    { x: 0.9, y: 0.12, size: 100, dash: 220, turn: 3 }
  ];
  /** 每只虾的栖息地（视口比例）与活动半径（px）：出去转一圈后倾向回到这里 */
  var SHRIMP_HOME = [
    { x: 0.2, y: 0.3, r: 200 },
    { x: 0.82, y: 0.45, r: 220 },
    { x: 0.12, y: 0.78, r: 180 },
    { x: 0.78, y: 0.82, r: 230 },
    { x: 0.9, y: 0.12, r: 160 }
  ];
  /** 水的阻力：速度每秒衰减的比例，越大滑行越短 */
  var WATER_DRAG = 3.2;

  /**
   * 腹节笔触：前端是一段外凸的圆弧（盖在后面一节上），后端平直被下一节盖住，整体像一笔侧锋按下去再拖出。
   * 从尾到头依次叠画，靠头的那节最后画、压在最上面，于是每节前端都圆头叠压在后面的节上，形成分节。
   */
  function segmentStroke(s) {
    var h0 = s.h0 / 2;
    var h1 = s.h1 / 2;
    return 'M' + s.x1 + ' ' + (s.y1 - h1) +
      'L' + s.x0 + ' ' + (s.y0 - h0) +
      'C' + (s.x0 - h0 * 0.9) + ' ' + (s.y0 - h0 * 0.6) + ' ' + (s.x0 - h0 * 0.9) + ' ' + (s.y0 + h0 * 0.6) + ' ' + s.x0 + ' ' + (s.y0 + h0) +
      'L' + s.x1 + ' ' + (s.y1 + h1) + 'Z';
  }

  function shrimpMarkup() {
    var ink = 'currentColor';
    var parts = [];
    // 尾扇（最淡，垫在最下面）
    SHRIMP_TAIL.forEach(function (t) {
      parts.push('<path class="op-shrimp__tail" d="' + t.d + '" fill="' + ink + '" fill-opacity="' + t.o + '"/>');
    });
    // 腹节：从尾到头叠画，靠头的一节最后画、圆头压在后面一节上，靠底色留白形成分节；头胸甲最后压在第一节上
    var body = SHRIMP_BODY.map(function (s) {
      return '<g class="op-shrimp__seg" style="transform-origin:' + ((s.x0 + s.x1) / 2) + 'px ' + ((s.y0 + s.y1) / 2) + 'px">' +
        // 每节先垫一笔背景色的底（略大一圈），再画淡墨；叠压时底色把后面一节擦出一道留白，模拟甲壳之间的空隙
      '<path d="' + segmentStroke(s) + '" fill="var(--op-bg)" stroke="var(--op-bg)" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="' + segmentStroke(s) + '" fill="' + ink + '" fill-opacity="' + s.o + '"/></g>';
    });
    parts.push(body.reverse().join(''));
    // 头胸甲：一笔浓墨，前尖后圆的小盾形，约为体长的四分之一；压在第一节之上
    parts.push('<g class="op-shrimp__head">' +
      '<path d="M48 60C52 50 62 45 74 46C86 47 92 53 92 61C92 70 83 76 71 75C60 74 52 68 48 60Z" fill="var(--op-bg)" stroke="var(--op-bg)" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M48 60C52 50 62 45 74 46C86 47 92 53 92 61C92 70 83 76 71 75C60 74 52 68 48 60Z" fill="' + ink + '" fill-opacity="0.55"/>' +
      // 头胸甲的轮廓：一侧重笔、一侧留白，模拟毛笔的提按
      '<path d="M50 58C55 50 64 45 75 46C82 47 87 50 89 54" stroke="' + ink + '" stroke-width="2.8" stroke-opacity="0.9" stroke-linecap="round" fill="none"/>' +
      '<path d="M54 66C60 73 70 77 80 74" stroke="' + ink + '" stroke-width="1.5" stroke-opacity="0.5" stroke-linecap="round" fill="none"/>' +
      // 额剑：头前端的尖刺
      '<path d="M50 59 L28 50" stroke="' + ink + '" stroke-width="2.2" stroke-opacity="0.9" stroke-linecap="round" fill="none"/>' +
      // 眼柄与眼
      '<path d="M56 56 L50 51" stroke="' + ink + '" stroke-width="1.3" fill="none"/>' +
      '<circle cx="49" cy="50" r="2.1" fill="' + ink + '"/>' +
      '</g>');
    var lines = '';
    SHRIMP_CLAWS.forEach(function (d) {
      lines += '<path class="op-shrimp__leg" d="' + d + '" stroke-width="1.5" stroke-opacity="0.6"/>';
    });
    SHRIMP_LEGS.forEach(function (d) {
      lines += '<path class="op-shrimp__leg" d="' + d + '" stroke-width="1.2" stroke-opacity="0.45"/>';
    });
    var antennae =
      '<path class="op-shrimp__antenna" d="M54 56 C33 39 -3 17 -39 23" stroke-width="1" stroke-opacity="0.5"/>' +
      '<path class="op-shrimp__antenna" d="M53 60 C27 65 -9 91 -43 87" stroke-width="1" stroke-opacity="0.5"/>';
    parts.push('<g stroke="' + ink + '" fill="none" stroke-linecap="round" stroke-linejoin="round">' + antennae + lines + '</g>');
    return parts.join('');
  }

  /** 把角度差归一到 [-π, π] */
  function angleDiff(a, b) { return Math.atan2(Math.sin(a - b), Math.cos(a - b)); }
  /** 把值限制在 [min, max] */
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  /**
   * 虾只在“有水流”时动：页面静止时完全不动，动画循环也停掉，不打扰阅读；
   * 用户滚动 = 水被搅动，每只虾按自己的敏感度积累一点“惊动”，过了阈值就倒退弹射一回。
   *
   * 真虾的游动是倒退的：腹尾向后急速一拍，把身体弹向头的反方向。所以一次“游”是：
   *   连拍 2~5 下（每下约 0.17s，身体弓起再放开，每拍补一股冲力）→ 惯性滑行、很快停住 → 一动不动。
   * 转向只在拍动过程中发生（拍的时候身体才拧过去），停着的时候不转向。
   * 朝向 heading 指向头的前方；弹射方向是 heading + π。
   */
  function initInkScene() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var scene = document.createElement('div');
    scene.id = 'op-ink-scene';
    scene.setAttribute('aria-hidden', 'true');
    scene.innerHTML = SHRIMPS.map(function (s) {
      return '<svg class="op-shrimp" viewBox="' + SHRIMP_VIEWBOX + '" width="' + s.size + '" height="' + Math.round(s.size * 170 / 300) + '">' +
        shrimpMarkup() + '</svg>';
    }).join('');
    document.body.appendChild(scene);
    /** 滚动多少像素算“被惊动 1.0”；再乘每只虾自己的敏感度 */
    var STIR_PER_PX = 1 / 220;
    /** 惊动超过多少才会开始弹射 */
    var STIR_TRIGGER = 0.22;
    var shrimps = $all('.op-shrimp', scene).map(function (s, i) {
      var cfg = SHRIMPS[i];
      return {
        cfg: cfg,
        svg: s,
        x: window.innerWidth * cfg.x,
        y: window.innerHeight * cfg.y,
        /** 当前位置的速度（px/s），由每一拍赋予、被阻力消耗 */
        vx: 0,
        vy: 0,
        /** 身体当前朝向（弧度），指向头的前方。画布中虾头朝左，所以 π = 头朝左 */
        heading: cfg.x < 0.5 ? Math.PI : 0,
        /** 这一回弹射的目标朝向（头的方向，实际往它的反面窜） */
        aim: cfg.x < 0.5 ? Math.PI : 0,
        /** 这一回还剩几拍 */
        flicks: 0,
        /** 距下一拍还有多久（s） */
        flickTimer: 0,
        /** 屈身幅度 0~1：每一拍置 1，随后快速放开 */
        curl: 0,
        /** 当前积累的惊动 */
        stir: 0,
        /** 冷却：两次弹射之间至少隔这么久（s），避免连续抖个不停 */
        cool: 0,
        /** 敏感度：有的虾一碰就窜，有的要搅得厉害才动 */
        nerve: 0.6 + Math.random() * 0.8,
        /** 摆动相位，只在运动时推进 */
        phase: i * 1.9,
        segs: $all('.op-shrimp__seg', s),
        tails: $all('.op-shrimp__tail', s),
        antennae: $all('.op-shrimp__antenna', s),
        legs: $all('.op-shrimp__leg', s)
      };
    });

    /** 这一回要往哪边窜：离栖息地太远就往回窜，否则在附近随意换个方向 */
    function pickAim(s, i) {
      var home = SHRIMP_HOME[i];
      var dx = window.innerWidth * home.x - s.x;
      var dy = window.innerHeight * home.y - s.y;
      /** 弹射是倒退的，所以头要朝着目标的反方向 */
      return Math.hypot(dx, dy) > home.r ? Math.atan2(dy, dx) + Math.PI : s.heading + (Math.random() - 0.5) * 1.8;
    }

    /** 画一帧身体姿态；motion 为当前运动强度 0~1，静止时全部归零、画面完全定格 */
    function pose(s, motion) {
      var sway = s.phase;
      var deg = (s.heading * 180 / Math.PI) % 360;
      /** 画布中虾头朝左、背朝上；头朝右时上下翻转，保证背始终朝上 */
      var flip = Math.abs(angleDiff(s.heading, Math.PI)) > Math.PI / 2 ? -1 : 1;
      var half = s.cfg.size / 2;
      s.svg.style.transform = 'translate3d(' + (s.x - half).toFixed(1) + 'px,' + (s.y - half * 0.52).toFixed(1) +
        'px,0) rotate(' + deg.toFixed(2) + 'deg) scaleY(' + flip + ')';
      var wag = Math.sin(sway * 3.2) * motion * 5;
      s.segs.forEach(function (seg, k) {
        // 屈身时每节向同一侧叠加越来越多的角度，身体就弓起来了
        seg.style.transform = 'rotate(' + (wag * (k + 1) * 0.4 + s.curl * (k + 1) * 3.5).toFixed(2) + 'deg)';
      });
      var tailDeg = 'rotate(' + (Math.sin(sway * 2.4) * motion * 4 + s.curl * 26).toFixed(2) + 'deg)';
      s.tails.forEach(function (t) { t.style.transform = tailDeg; });
      s.antennae.forEach(function (a, k) {
        a.style.transform = 'rotate(' + (Math.sin(sway * 0.8 + k * 2) * motion * 7).toFixed(2) + 'deg)';
      });
      s.legs.forEach(function (leg, k) {
        leg.style.transform = 'rotate(' + (Math.sin(sway * 1.6 + k * 1.3) * motion * 9).toFixed(2) + 'deg)';
      });
    }

    var running = false;
    var last = 0;
    var scroll = window.scrollY;
    var target = window.scrollY;
    var raf = 0;

    function frame(now) {
      raf = 0;
      var dt = clamp((now - last) / 1000, 0.001, 0.05);
      last = now;
      // 远山随滚动缓缓升起
      var diff = target - scroll;
      scroll += diff * 0.18;
      document.documentElement.style.setProperty('--op-ink-rise', clamp(scroll / 700, 0, 1) * 150 + 'px');
      var w = window.innerWidth;
      var h = window.innerHeight;
      var drag = Math.exp(-4.6 * dt);
      var calm = Math.abs(diff) < 0.5;
      var flow = clamp(diff * 0.02, -1, 1);
      shrimps.forEach(function (s, i) {
        s.stir *= Math.exp(-1.2 * dt);
        s.cool -= dt;
        var speed = Math.hypot(s.vx, s.vy);
        if (s.flicks > 0) {
          // 拍动中：身体快速拧向目标朝向，到点了就拍一下
          s.heading += angleDiff(s.aim, s.heading) * clamp(s.cfg.turn * 3 * dt, 0, 1);
          s.flickTimer -= dt;
          if (s.flickTimer <= 0) {
            var power = s.cfg.dash * (0.75 + Math.random() * 0.5);
            var back = s.heading + Math.PI + (Math.random() - 0.5) * 0.25;
            s.vx += Math.cos(back) * power;
            s.vy += Math.sin(back) * power;
            s.curl = 1;
            s.flicks -= 1;
            s.flickTimer = 0.16 + Math.random() * 0.06;
          }
        } else if (s.cool <= 0 && s.stir > STIR_TRIGGER) {
          // 被搅得够了：开始一回弹射，搅得越厉害拍得越多
          s.aim = pickAim(s, i);
          s.flicks = clamp(Math.round(1 + s.stir * 2), 2, 5);
          s.flickTimer = 0.02;
          s.stir = 0;
          s.cool = 0.7 + Math.random() * 0.9;
        } else if (speed > 8) {
          // 滑行中：顺势再转一点点
          s.heading += angleDiff(s.aim, s.heading) * clamp(s.cfg.turn * 0.4 * dt, 0, 1);
        }
        if (s.flicks === 0) {
          s.curl *= Math.exp(-11 * dt);
          s.vx *= drag;
          s.vy *= drag;
        }
        var motion = clamp(speed / 220, 0, 1);
        s.phase += dt * 2.2 * motion;
        s.x += (s.vx + flow * 40 * motion) * dt;
        s.y += (s.vy - flow * 60 * motion) * dt;
        var half = s.cfg.size / 2;
        if (s.x < -half || s.x > w + half || s.y < -half || s.y > h + half) {
          // 窜出画面了：立刻受惊，掉头拍回画面里
          s.x = clamp(s.x, -half, w + half);
          s.y = clamp(s.y, -half, h + half);
          var toCenter = Math.atan2(h / 2 - s.y, w / 2 - s.x) + Math.PI;
          s.aim = toCenter;
          s.heading = toCenter;
          s.flicks = 3;
          s.flickTimer = 0.05;
          s.vx = 0;
          s.vy = 0;
        }
        pose(s, motion);
        // 这一只要等它彻底停下、惊动散尽、冷却结束，才算安静下来
        calm = calm && s.flicks === 0 && speed < 6 && s.curl < 0.01 && s.stir < STIR_TRIGGER && s.cool <= 0;
      });
      // 全都安静了就停掉循环：不滚动就不再有任何重绘
      if (calm) {
        running = false;
        scroll = target;
        shrimps.forEach(function (s) { s.curl = 0; s.vx = 0; s.vy = 0; pose(s, 0); });
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    /** 有事要动时才启动循环 */
    function wake() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener('scroll', function () {
      var dy = Math.abs(window.scrollY - target);
      target = window.scrollY;
      shrimps.forEach(function (s) {
        s.stir = Math.min(1.6, s.stir + dy * STIR_PER_PX * s.nerve);
      });
      wake();
    }, { passive: true });
    window.addEventListener('resize', function () {
      shrimps.forEach(function (s) {
        s.x = clamp(s.x, 0, window.innerWidth);
        s.y = clamp(s.y, 0, window.innerHeight);
      });
      wake();
    });
    shrimps.forEach(function (s) { pose(s, 0); });
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
    initInkWatermark();
    initInkScene();
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
