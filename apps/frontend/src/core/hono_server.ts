import { Context, Hono } from 'hono'
import { currentConfig, tempConfig } from './config.ts'
import { get_doc_by_hpath } from './cache.ts'
import { htmlTemplate } from './htmlTemplate.ts'
import { renderHTML } from './render.ts'
import { stream } from 'hono/streaming'
import type { StatusCode } from 'hono/utils/http-status'
import { Effect } from 'effect'
import { EffectDep, type effectDepApi } from './EffectDep.ts'

export function createHonoApp(app: Hono = new Hono(), renderapi: effectDepApi) {
  app.get('/', (c) => c.redirect('/index.html'))
  app.get('/assets/*', assetsHandle)
  app.get('/favicon.ico', assetsHandle)
  app.get('*', async (c) => {
    const path = decodeURIComponent(c.req.path)
    const p = Effect.provideService(
      renderHtmlByUriPath(path),
      EffectDep,
      renderapi,
    )
    const r = await Effect.runPromise(
      Effect.match(p, {
        onSuccess(value) {
          return value
        },
        onFailure(err) {
          if (err.message.includes('not doc')) {
            return assetsHandle(c)
          }
          console.log('[err]', err)
          throw err
        },
      }),
    )
    if (r instanceof Error) {
      throw r
    } else if (typeof r === 'string') {
      return c.html(r)
    } else {
      return r
    }
  })
  return app
}
async function assetsHandle(c: Context) {
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
function renderHtmlByUriPath(path: string) {
  return Effect.gen(function* () {
    const hpath = decodeURIComponent(path)
      .replace(/\#(.*)?$/, '')
      .replace(/\.html$/, '')

    const doc = yield* Effect.match(
      Effect.tryPromise(() => get_doc_by_hpath(hpath)),
      {
        onSuccess(value) {
          return value
        },
        onFailure(error) {
          console.error('获取文档失败: ', error)
          return 'not found' as const
        },
      },
    )
    if (doc === 'not found') {
      return doc
    }
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
