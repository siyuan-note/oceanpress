import { serve } from '@hono/node-server'
import { createHonoApp } from './core/hono_server.ts'

export function server(config = { port: 80, hostname: '0.0.0.0' }) {
  const app = createHonoApp()
  return new Promise((resolve, _reject) => {
    serve(
      {
        fetch: app.fetch,
        port: config.port,
        hostname: config.hostname,
      },
      (info) => {
        resolve({ info, app })
        console.log(`Listening on :${JSON.stringify(info)}`)
      },
    )
  })
}
