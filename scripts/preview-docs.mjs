/**
 * 临时本地预览服务器：托管构建产物 docs/，并模拟线上 /notebook/ 静态资源前缀
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const port = 8931
/** 线上站点把 public/notebook 部署在 /notebook/ 前缀下；同时模拟 jsdelivr CDN 的 gh 路径 */
/** 思源静态资源目录：线上由 jsdelivr gh CDN 提供，本地预览一律映射到这里 */
const notebookDir = '/home/gs/opensource_code/oceanpress/apps/frontend/public/notebook'
/** 产物里 jsdelivr gh CDN 的任意版本地址前缀 */
const CDN_RE = /https:\/\/(?:fastly\.)?jsdelivr\.net\/gh\/siyuan-note\/oceanpress@[\w.\-]+\/apps\/frontend\/public\/notebook\//g

const roots = [
  { prefix: '/notebook/', dir: notebookDir },
  { prefix: '/public-mock/', dir: '/home/gs/opensource_code/oceanpress/apps/frontend/public' },
  { prefix: '/', dir: '/home/gs/opensource_code/doc/docs' },
]

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
}

createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname)
    const root = roots.find((r) => urlPath.startsWith(r.prefix))
    if (!root) {
      res.writeHead(404).end('not found')
      return
    }
    let filePath = normalize(join(root.dir, urlPath.slice(root.prefix.length)))
    if (!filePath.startsWith(root.dir)) {
      res.writeHead(403).end('forbidden')
      return
    }
    const s = await stat(filePath).catch(() => null)
    if (s?.isDirectory()) filePath = join(filePath, 'index.html')
    let content = await readFile(filePath)
    /** html 里的 CDN 地址改写为本地 /notebook/ 前缀，未发版的主题改动也能即时预览 */
    if (extname(filePath) === '.html') {
      content = Buffer.from(content.toString('utf8').replace(CDN_RE, '/notebook/'))
    }
    res.writeHead(200, {
      'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    })
    res.end(content)
  } catch {
    res.writeHead(404).end('not found')
  }
}).listen(port, () => {
  console.log(`preview: http://localhost:${port}/`)
})
