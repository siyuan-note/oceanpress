import { writeFileSync, readFileSync } from 'fs'
import { storeDep } from '@/core/dependency.ts'

storeDep.getItem = getItem
storeDep.setItem = setItem

export function setItem(key: string, value: string) {
  return writeFileSync(`./store/${key}`, value, 'utf-8')
}

export function getItem(key: string): string | undefined {
  try {
    return readFileSync(`./store/${key}`, 'utf-8')
  } catch (_) {
    return undefined
  }
}
