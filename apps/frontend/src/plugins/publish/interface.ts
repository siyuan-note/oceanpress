import type { Config } from '~/core/config.ts'
import type { FileTree } from '~/core/build.ts'

export interface uploadFiles {
  (tree: FileTree, config: Config): AsyncGenerator<
    readonly [string, string | undefined],
    void,
    unknown
  >
}
