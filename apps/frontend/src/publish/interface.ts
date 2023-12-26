import type { Config } from '~/config/index.ts'
import type { FileTree } from '~/core/build.ts'

export interface uploadFiles {
  (tree: FileTree, config: Config): Promise<any>
}
