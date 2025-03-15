import { Context, Hono } from 'hono'
import { currentConfig, tempConfig } from './config.ts'
import { get_doc_by_hpath } from './cache.ts'
import { htmlTemplate } from './htmlTemplate.ts'
import { renderHTML } from './render.ts'
import { stream } from 'hono/streaming'
import type { StatusCode } from 'hono/utils/http-status'

export function createHonoApp(app: Hono = new Hono()) {
  app.get('/', (c) => c.redirect('/index.html'))
  app.get('/assets/*', assetsHandle)
  app.get('*', async (c) => {
    const path = decodeURIComponent(c.req.path)

    const r = await renderHtmlByUriPath(path).catch(async (err: Error) => {
      if (err.message.includes('not doc')) {
        return await assetsHandle(c)
      }
      throw err
    })

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
async function renderHtmlByUriPath(path: string): Promise<string | Error> {
  const hpath = decodeURIComponent(path)
    .replace(/\#(.*)?$/, '')
    .replace(/\.html$/, '')

  const doc = await get_doc_by_hpath(hpath)

  return await htmlTemplate(
    {
      title: doc.Properties?.title || '',
      htmlContent: await renderHTML(doc),
      level: path.split('/').length - 1 /** 最开头有一个 /  */,
    },
    {
      ...tempConfig.cdn,
      embedCode: currentConfig.value.embedCode,
    },
  )
}
