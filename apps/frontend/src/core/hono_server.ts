import { Context as HonoContext, Hono } from 'hono'
import { currentConfig, tempConfig } from './config.ts'
import { get_doc_by_hpath } from './cache.ts'
import { htmlTemplate } from './htmlTemplate.ts'
import { renderHTML } from './render.ts'
import { stream } from 'hono/streaming'
import type { StatusCode } from 'hono/utils/http-status'
import { Effect, Context } from 'effect'
import {
  EffectConfigDep,
  EffectRender,
  type EffectRenderApi,
} from './EffectDep.ts'

export function createHonoApp(
  app: Hono = new Hono(),
  renderapi: EffectRenderApi,
) {
  app.get('/', (c) => c.redirect('/index.html'))
  app.get('/assets/*', assetsHandle)
  app.get('/favicon.ico', assetsHandle)
  app.get('*', async (c) => {
    const path = decodeURIComponent(c.req.path)
    const context = Context.empty().pipe(
      Context.add(EffectRender, renderapi),
      Context.add(EffectConfigDep, currentConfig.value),
    )
    const p = Effect.provide(renderHtmlByUriPath(path), context)
    const r = await Effect.runPromise(p)
    return c.html(r)
  })
  return app
}
async function assetsHandle(c: HonoContext) {
  // TODO 处于安全考虑应该防范 file 跳出 assets
  const file = c.req.path
  const widgetPrefix = '/assets/widget/'
  const isWidget = file.startsWith(widgetPrefix)
  const apiPath = `${currentConfig.value.apiPrefix}${
    isWidget ? '/api/file/getFile' : file
  }`
  const r = await fetch(apiPath, {
    headers: {
      Authorization: `Token ${currentConfig.value.authorized}`,
    },
    method: isWidget ? 'POST' : 'GET',
    body: isWidget
      ? JSON.stringify({
          path: `/data/storage/oceanpress/widget_img/${file.substring(
            widgetPrefix.length,
          )}`,
        })
      : undefined,
  })
  const body = r.body
  if (!body) {
    return c.text('响应体为 null', 500, { 'Content-Type': 'text/plain' })
  }
  c.status(r.status as StatusCode)
  return stream(c, async (writeStream) => {
    const reader = body.getReader()
    while (true) {
      const r = await reader.read()
      if (r.done) {
        writeStream.close()
        break
      } else {
        writeStream.write(r.value)
      }
    }
  })
}
/** 渲染文档，通过 path 路径 */
function renderHtmlByUriPath(path: string) {
  console.log('[path]', path)

  return Effect.gen(function* () {
    const hpath = decodeURIComponent(path)
      .replace(/\#(.*)?$/, '')
      .replace(/\.html$/, '')

    const doc = yield* Effect.tryPromise(() => get_doc_by_hpath(hpath))
    const htmlContent = yield* renderHTML(doc)
    return yield* Effect.tryPromise(() =>
      htmlTemplate(
        {
          title: doc.Properties?.title || '',
          htmlContent,
          level: path.split('/').length - 1 /** 最开头有一个 /  */,
        },
        {
          ...tempConfig.cdn,
          embedCode: currentConfig.value.embedCode,
        },
      ),
    )
  })
}
