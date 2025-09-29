

import './cli/deploy.ts'
import './cli/build.ts'
import './cli/server.ts'
import { program } from './cli/common.ts'

// 全局错误处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
  process.exit(1)
})

program.parse(process.argv)
