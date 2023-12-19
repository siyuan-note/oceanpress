import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { API } from './core/siyuan_api'
import { currentConfig } from './config'
import { renderHTML } from './core/render'
import { DB_block, S_Node } from './core/siyuan_type'
import '@/core/render.api.dep'
import { htmlTemplate } from './core/htmlTemplate'

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
  const ids = await API.filetree_getIDsByHPath({
    notebook: currentConfig.value.notebook.id,
    path: hpath,
  })
  console.log(hpath)

  const docBlocks: DB_block[] = await API.query_sql({
    stmt: `SELECT * from blocks
    WHERE hpath = '${hpath}'
      AND type = 'd' `,
  })
  if (docBlocks.length === 0) {
    return new Error('not found')
  } else if (docBlocks.length > 1) {
    return new Error(
      `该路径存在多个文档与之对应: ${ids.join(
        ' ',
      )},但一个 url 应该只指向一个文档的`,
    )
  }
  const docBlock = docBlocks[0]
  const doc = (await API.file_getFile({
    path: `data/${currentConfig.value.notebook.id}/${docBlock.path}`,
  })) as S_Node

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
