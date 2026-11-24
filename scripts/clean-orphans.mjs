/** 清理产物目录里不在本次构建中、且没有被任何页面引用的旧 html
 *  用法：node scripts/clean-orphans.mjs <输出目录>
 *  判定依据：引用了旧模板（appearance/oceanpress.css）+ 不在 sitemap 里 + 无其他页面链接到它
 *  被引用的旧页面会保留并列出，删掉它们会造成死链，需要先在笔记里处理链接 */
import { readdir, readFile, unlink, rmdir } from 'fs/promises'
import { join, basename, relative } from 'path'

const root = process.argv[2]
if (!root) {
  console.error('用法：node scripts/clean-orphans.mjs <输出目录>')
  process.exit(1)
}

/** 递归收集目录下所有文件 */
async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

const files = await walk(root)
const htmls = files.filter((f) => f.endsWith('.html'))

/** 读取文件文本，读失败按空串处理 */
const textOf = async (f) => readFile(f, 'utf-8').catch(() => '')

/** 旧模板标记：本次构建的页面只引用 site.css */
const OLD = 'appearance/oceanpress.css'
const stale = new Set()
for (const f of htmls) {
  if ((await textOf(f)).includes(OLD)) stale.add(f)
}

/** 本次构建收录的页面（sitemap），这些一定不是孤儿 */
const sitemap = await textOf(join(root, 'sitemap.xml'))
const inSitemap = (name) => sitemap.includes(encodeURI(name).replace(/\.html$/, ''))

/** 所有非孤儿文件里链接到的 html 文件名 */
const linked = new Set()
for (const f of files) {
  if (stale.has(f)) continue
  const t = await textOf(f)
  if (!t) continue
  for (const m of t.matchAll(/href="([^"#?]+\.html)/g)) {
    linked.add(basename(decodeURI(m[1]).replace(/\/$/, '')))
  }
}

const drop = []
const keep = []
for (const f of stale) {
  const name = relative(root, f)
  const referenced = linked.has(basename(name)) || inSitemap(name)
  ;(referenced ? keep : drop).push(name)
}

for (const name of drop) await unlink(join(root, name))

/** 删掉因此变空的目录，由深到浅 */
const dirs = new Set(drop.map((d) => join(root, d, '..')))
for (const d of [...dirs].sort((a, b) => b.length - a.length)) {
  const left = await readdir(d).catch(() => null)
  if (left && left.length === 0) {
    await rmdir(d)
    console.log('空目录已删:', relative(root, d))
  }
}

console.log(`已删除无引用旧页面 ${drop.length} 个`)
console.log(`仍被引用、已保留 ${keep.length} 个（删除会造成死链，需先处理笔记里的链接）:`)
for (const k of keep) console.log('  ', k)
