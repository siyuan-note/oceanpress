import '~/util/store.bower.dep'
import '~/core/render.api.dep'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from '~/pages/App.tsx'
import steps from '~/pages/steps/steps.tsx'

const routes = [{ path: '/', component: steps }]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const app = createApp(App)

app.use(router)
app.mount('#app')
app.provide('config', {})
