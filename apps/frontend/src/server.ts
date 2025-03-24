import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Effect } from 'effect'
import { Hono } from 'hono'
import { EffectRender } from './core/EffectDep.ts'
import { createHonoApp } from './core/hono_server.ts'

export function server(config = { port: 80, hostname: '0.0.0.0' }) {
  return Effect.gen(function* () {
    const app = new Hono()
    // 方便开发调试样式
    app.use(
      '/notebook/*',
      serveStatic({
        root: './public/',
        onNotFound(path, c) {
          console.log('[onNotFound notebook path]', path)
          // ./public/notebook/appearance/fonts/JetBrainsMono-2.304/JetBrainsMono-Regular.woff2
          // ./public/notebook/appearance/fonts\JetBrainsMono-2.304/JetBrainsMono-Regular.woff2
        },
      }),
    )
    const effectDep = yield* EffectRender
    createHonoApp(app, effectDep)
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
  })
}
