import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { storeDep } from '~/core/dependency.ts'

storeDep.getItem = getItem
storeDep.setItem = setItem

export function setItem(key: string, value: string) {
  if (!existsSync('./store/')) {
    // 目录不存在，递归创建目录
    mkdirSync('./store/', { recursive: true })
  }
  return writeFileSync(`./store/${key}`, value, {
    encoding: 'utf-8',
  })
}

export function getItem(key: string): string | undefined {
  try {
    return readFileSync(`./store/${key}`, 'utf-8')
  } catch (_) {
    return undefined
  }
}
