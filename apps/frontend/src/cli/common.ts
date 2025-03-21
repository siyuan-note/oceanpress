import '~/core/render.api.dep.ts'
import '~/util/store.node.dep.ts'
import { Command } from 'commander'

export const program = new Command()

program
  .name('OceanPress')
  .description('这是一款从思源笔记本生成一个静态站点的工具')
