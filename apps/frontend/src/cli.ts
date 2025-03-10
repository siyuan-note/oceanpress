import '~/core/render.api.dep'
import '~/util/store.node.dep'

import './cli/deploy.ts'
import './cli/build.ts'
import './cli/server.ts'
import { program } from './cli/common.ts'

program.parse(process.argv)
