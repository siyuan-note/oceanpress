#!/usr/bin/env node
/**
 * 全站链接检测：扫描构建产物里所有 html 的 href / src，逐个验证站内链接是否可达。
 *
 * 用法：node scripts/check-links.mjs <构建输出目录>
 * 退出码：存在坏链接时为 1，方便接进 CI。
 */

import { readdir, readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'

const root = resolve(process.argv[2] ?? '')
if (!process.argv[2]) {
  console.error('用法: node scripts/check-links.mjs <构建输出目录>')
  process.exit(2)
}

/** 无需检测的外部 / 非页面协议 */
const SKIP_PROTOCOL = /^(https?:)?\/\/|^^(mailto|tel|data|javascript|siyuan|vscode-webview|blob|ftp):/i
/** 链接属性里出现的实体，需要还原成字符才能判断路径 */
const decodeEntity = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) await walk(full, out)
    else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

/** 站内路径是否存在；返回实际命中的文件，不存在返回 null */
async function resolveTarget(abs) {
  for (const candidate of [abs, `${abs}.html`, join(abs, 'index.html')]) {
    if (await stat(candidate).then((s) => s.isFile(), () => false)) return candidate
  }
  return null
}

const problems = []
const note = (kind, file, raw, detail = '') =>
  problems.push({ kind, file: relative(root, file).split(sep).join('/'), raw, detail })

const files = await walk(root)
let checked = 0
const anchorCache = new Map()

for (const file of files) {
  const html = await readFile(file, 'utf8')
  const attrRe = /\b(?:href|src)="([^"]*)"/g
  for (const match of html.matchAll(attrRe)) {
    const raw = decodeEntity(match[1])
    if (!raw || raw.startsWith('#') || SKIP_PROTOCOL.test(raw)) continue
    checked++

    if (/%25/i.test(raw)) {
      note('重复编码（% 被编成 %25）', file, raw)
      continue
    }
    if (raw.startsWith('/')) {
      note('根绝对路径（部署到子目录会失效）', file, raw)
      continue
    }
    const [pathPart, hash] = raw.split('#')
    const [cleanPath, query] = pathPart.split('?')
    const rel = decodeURIComponent(cleanPath)
    const target = await resolveTarget(resolve(dirname(file), rel))
    if (!target) {
      note('目标不存在', file, raw)
      continue
    }
    if (query !== undefined) note('带查询参数（静态站点无对应页面）', file, raw)
    if (hash) {
      if (!anchorCache.has(target)) {
        anchorCache.set(target, await readFile(target, 'utf8'))
      }
      if (!new RegExp(`(?:id|name)="${hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(anchorCache.get(target))) {
        note('锚点不存在', file, raw)
      }
    }
  }
}

console.log(`检测 ${files.length} 个页面，${checked} 个站内链接`)

const grouped = new Map()
for (const p of problems) grouped.set(p.kind, [...(grouped.get(p.kind) ?? []), p])
if (!grouped.size) {
  console.log('✅ 没有发现坏链接')
  process.exit(0)
}
for (const [kind, list] of grouped) {
  console.log(`\n❌ ${kind}: ${list.length} 处`)
  const seen = new Set()
  for (const p of list) {
    const key = p.raw
    if (seen.has(key)) continue
    seen.add(key)
    if (seen.size > 12) {
      console.log(`   … 另有 ${new Set(list.map((x) => x.raw)).size - 12} 种不同链接`)
      break
    }
    console.log(`   ${p.raw.slice(0, 110)}   ← ${p.file}`)
  }
}
process.exit(1)
