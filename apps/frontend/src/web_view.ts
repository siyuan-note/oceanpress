import '~/util/store.bower.dep.ts'
import '~/core/render.api.dep.ts'

import { createApp, watchEffect } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from '~/pages/App.tsx'
import steps from '~/pages/steps/steps.tsx'
import { configs } from './core/config.ts'
import { swConfigsPrefix } from './sw/const.ts'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{ path: '/', component: steps }],
})

const app = createApp(App)

app.use(router)
app.mount('#app')

navigator.serviceWorker
  /** 开发模式下 Firefox 还不支持 module，只能在 chrome 系下调试 */
  .register(import.meta.env.PROD ? 'sw.iife.js' : '/sw.ts', {
    scope: '/',
    // 使用了 import 语句的必须要是 module 类型。
    type: import.meta.env.PROD ? 'classic' : 'module',
  })
  .then(async (sw: ServiceWorkerRegistration) => {
    await sw.update() // 当之前缓存的 sw 与现有的存在不一致时会重新安装
    watchEffect(async () => {
      await (
        await fetch(swConfigsPrefix, {
          body: JSON.stringify(configs),
          method: 'POST',
        })
      ).json()
    })
  })
  .catch((e) => {
    console.log('sw 注册失败', e)
  })

if (import.meta.env.PROD) {
  // https://clarity.microsoft.com 站点分析
  eval(`(function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        ;(c[a].q = c[a].q || []).push(arguments)
      }
    t = l.createElement(r)
    t.async = 1
    t.src = 'https://www.clarity.ms/tag/' + i
    y = l.getElementsByTagName(r)[0]
    y.parentNode.insertBefore(t, y)
  })(window, document, 'clarity', 'script', 'kdd1bzgo7w')`)
}
