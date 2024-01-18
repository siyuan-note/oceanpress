import { storeDep } from '~/core/dependency.ts'
import '~/core/render.api.dep.ts'
import { createHonoApp } from './src/core/hono_server.ts'
import { Hono } from 'hono'
import { loadConfigFile } from '~/core/config.ts'
import { setCache } from '~/core/cache.ts'
import { swConfigsPrefix, swPrefix } from '~/sw/const.ts'
// 这个文件放在最外层是为了方便开发时调试，因为 sw 的 scop 规定

storeDep.getItem = getItem
storeDep.setItem = setItem
setCache(false)

function setItem(_key: string, _value: string) {
  // TODO 没有需要
}
function getItem(_key: string): string | undefined {
  return
}

const renderServer = createHonoApp()
const app = new Hono()

app.use('*', async (c, next) => {
  await next()
})
// 从主线程接收配置文件
app.post(swConfigsPrefix, async (c) => {
  const r = await c.req.json()
  console.log('接收配置文件完毕', r)
  loadConfigFile(r)
  return c.json({ ok: true })
})

app.get(`${swPrefix}*`, async (c) => {
  const url = c.req.path.substring(swPrefix.length)
  // 转发到渲染服务器
  return renderServer.request(url)
})
app.notFound(async (c) => {
  // 请求转发给真实服务器
  return fetch(c.req.raw)
})
//
app.fire()
self.addEventListener('install', (event) => {
  console.log('sw installed🎉', event)
  //@ts-ignore 跳过等待激活阶段，立即激活新的Service Worker
  self.skipWaiting()
})
