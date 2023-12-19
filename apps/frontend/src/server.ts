import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { currentConfig } from './config'
import { renderHTML } from './core/render'
import { DB_block } from './core/siyuan_type'
import { htmlTemplate } from './core/htmlTemplate'
import { getIDsByHPath, get_doc_by_hpath, query_sql } from './core/cache'

export function server() {
  const app = new Hono()
  app.use(async (_, next) => {
    try {
      await next()
    } catch (error) {
      console.log(error)
    }
  })
  app.get('/', (c) => c.redirect('/index.html'))
  app.get('/assets/:file', async (c) => {
    // TODO 处于安全考虑应该防范 file 跳出 assets
    const file = c.req.param('file')

    const r = await fetch(`${currentConfig.value.apiPrefix}/assets/${file}`, {
      headers: {
        Authorization: `Token ${currentConfig.value.authorized}`,
      },
      method: 'GET',
    })

    if (!r.body) {
      return c.text('Not Found', 404, { 'Content-Type': 'text/plain' })
    }
    return c.stream(
      async (stream) => {
        const reader = r.body!.getReader()
        console.log(file)
        while (true) {
          const r = await reader.read()
          if (r.done) {
            stream.close()
            break
          } else {
            stream.write(r.value)
          }
        }
      },
      200,
      {
        'content-type': r.headers.get('content-type')!,
      },
    )
  })
  app.get('*', async (c) => {
    const path = c.req.path
    const r = await renderHtmlByPath(path).catch((err) => {
      return err
    })

    if (r instanceof Error) throw r
    return c.html(r)
  })
  return new Promise((resolve, _reject) => {
    serve(
      {
        fetch: app.fetch,
        port: 80,
      },
      (info) => {
        resolve({ info, app })
        console.log(`Listening on :${JSON.stringify(info)}`)
      },
    )
  })
}

async function renderHtmlByPath(path: string): Promise<string | Error> {
  const hpath = decodeURIComponent(path).replace(/\.html$/, '')

  const doc = await get_doc_by_hpath(hpath)

  return await htmlTemplate(
    {
      title: doc.Properties?.title || '',
      htmlContent: await renderHTML(doc),
      level: path.split('/').length - 1 /** 最开头有一个 /  */,
    },
    {
      ...currentConfig.value.cdn,
      embedCode: currentConfig.value.embedCode,
    },
  )
}
