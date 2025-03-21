import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { createHonoApp } from './core/hono_server.ts'
import { renderApiDep } from './core/render.api.dep.ts'

export function server(config = { port: 80, hostname: '0.0.0.0' }) {
  const app = new Hono()
  // 方便开发调试样式
  app.use(
    '/notebook/*',
    serveStatic({
      root: './public/',
      onNotFound(path, c) {
        console.log('[onNotFound notebook path]', path)
      },
    }),
  )
  createHonoApp(app, renderApiDep)
  return new Promise((resolve, _reject) => {
    serve(
      {
        fetch: app.fetch,
        port: config.port,
        hostname: config.hostname,
      },
      (info) => {
        resolve({ info, app })
        console.log(`Listening on http://${info.address}:${info.port}`)
      },
    )
  })
}
