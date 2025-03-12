import { Config, currentConfig } from '~/core/config.ts'
import { htmlTemplate } from './htmlTemplate.ts'
import { getRender, renderHTML } from './render.ts'
import { API } from './siyuan_api.ts'
import { DB_block, DB_block_path, S_Node } from './siyuan_type.ts'
import { deepAssign } from '~/util/deep_assign.ts'
import {
  allDocBlock_by_bookId,
  get_doc_by_SyPath,
  get_node_by_id,
} from './cache.ts'
import packageJson from '~/../package.json' with { type: 'json' };
import { generateRSSXML, sitemap_xml } from './genRssXml.ts'
import { downloadZIP } from './genZip.ts'

export interface DocTree {
  [/** "/计算机基础课/自述" */ docPath: string]: {
    sy: S_Node
    docBlock: DB_block
  }
}
export interface FileTree {
  [path: string]: string | ArrayBuffer
}
export type Build = typeof build
/** 根据配置文件进行编译
 * TODO 将浏览器写文件的部分抽离出去，也改成使用 onFileTree
 */
export async function* build(
  config: Config,
  otherConfig?: {
    // 监听文件准备完毕 TODO：应该修改实现，而非目前直接全量加载到内存
    onFileTree?: (tree: FileTree) => void
    renderHtmlFn?: typeof renderHTML
  },
) {
  const _renderHTML = otherConfig?.renderHtmlFn ?? renderHTML
  const book = config.notebook
  const docTree: DocTree = {}
  const skipBuilds = useSkipBuilds()
  const emit = {
    log(_s: string) {},
    percentage(_n: number) {},
    docTree,
  }
  let oldPercentage = 0
  let total = 0
  /** 较为精准的估计进度 */
  function processPercentage(
    /**  0~1 的小数 表示这个数占整体百分之多少 */ percentage: number,
  ) {
    total += oldPercentage
    return (/** 0~1 的小数 */ process: number) => {
      oldPercentage = process * percentage
      emit.percentage((total + oldPercentage) * 100)
    }
  }
  yield emit
  yield `=== 开始编译 ${book.name} ===`
  let process = processPercentage(0.4)
  /** 查询所有文档级block
   * TODO 增量编译时不应该全部获取
   */
  const Doc_blocks: DB_block[] = await allDocBlock_by_bookId(book.id)
  /** docBlock 的引用没有更新：true */
  function refsNotUpdated(docBlock: DB_block): boolean {
    const refs = config.__skipBuilds__[docBlock.id]?.refs ?? []
    for (const ref_id of refs) {
      const new_doc_hash = Doc_blocks.find(
        (docBlock) => docBlock.id === ref_id,
      )?.hash
      const old_doc_hash = config.__skipBuilds__[ref_id]?.hash
      if (new_doc_hash === undefined || old_doc_hash === undefined) {
        /** 不应该进入此分支的，如果进来了就重新编译吧 */
        return false
      } else if (new_doc_hash === old_doc_hash) {
        continue
      } else {
        return false
      }
    }
    /** 引用的都没有更新 */
    return true
  }
  yield `=== 查询文档级block完成 ===`
  let i = 0
  await Promise.all(
    Doc_blocks.map(async (docBlock) => {
      const sy = await get_doc_by_SyPath(DB_block_path(docBlock))
      docTree[docBlock.hpath] = { sy, docBlock }
      i++
      process(i / Doc_blocks.length)
    }),
  )
  const fileTree: FileTree = {}

  process = processPercentage(0.4)

  const enableIncrementalCompilation_doc = (() => {
    if (packageJson.version !== config.OceanPress.version) {
      emit.log(
        `配置文件版本号[${config.OceanPress.version}]与OceanPress版本[${packageJson.version}]不一致，将进行文档全量编译`,
      )
      return false
    }
    return config.enableIncrementalCompilation_doc
  })()
  yield `=== 开始渲染文档 ===`
  await Promise.all(
    Object.entries(docTree).map(async ([path, { sy, docBlock }]) => {
      if (
        config.enableIncrementalCompilation &&
        enableIncrementalCompilation_doc &&
        /** 文档本身没有发生变化 */
        config.__skipBuilds__[docBlock.id]?.hash === docBlock.hash &&
        /** docBlock所引用的文档也没有更新 */
        refsNotUpdated(docBlock)
      )
        return /** skip */

      try {
        const rootLevel =
          path.split('/').length -
          2 /** 最开头有一个 /  还有一个 data 目录所以减二 */
        const renderInstance = getRender()

        fileTree[path + '.html'] = await htmlTemplate(
          {
            title: sy.Properties?.title || '',
            htmlContent: await _renderHTML(sy, renderInstance),
            level: rootLevel,
          },
          {
            ...config.cdn,
            embedCode: config.embedCode,
          },
        )

        /** rss.xml 生成 */
        if (config.sitemap.rss && path.endsWith('.rss.xml')) {
          const rssPath = path
          fileTree[rssPath] =await generateRSSXML(rssPath, renderInstance, config)
          emit.log(`渲染 rss.xml:${rssPath} 完毕`)
        }
        if (
          config.enableIncrementalCompilation &&
          config.enableIncrementalCompilation_doc
        ) {
          /** 更新为当前hash */
          skipBuilds.add(docBlock.id, {
            hash: docBlock.hash,
          })
        }
        /** 无论是否配置增量更新都要更新正向引用，不然开启增量更新后没有引用数据可用 */
        skipBuilds.add(docBlock.id, {
          refs: /** 保存引用 */ [...renderInstance.refs.values()],
        })
      } catch (error) {
        emit.log(`${path} 渲染失败:${error}`)
        console.log(error)
      }
      process(i / Doc_blocks.length)
      emit.log(`渲染完毕:${path}`)
    }),
  )
  yield `=== 渲染文档完成 ===`
  yield `=== 开始生成 sitemap.xml ===`
  if (config.sitemap.enable) {
    fileTree['sitemap.xml'] = sitemap_xml(Doc_blocks, config.sitemap)
  }
  if (config.excludeAssetsCopy === false) {
    yield `=== 开始复制资源文件 ===`
    const assets: {
      box: string
      docpath: string
      path: string
      hash: string
      id: string
    }[] = await API.query_sql({
      stmt: `SELECT * from assets
             WHERE box = '${book.id}'
            limit 150000 OFFSET 0`,
    })
    await Promise.all(
      assets.map(async (item) => {
        if (
          config.enableIncrementalCompilation &&
          /** 资源没有变化，直接跳过 */
          config.__skipBuilds__[item.id]?.hash === item.hash
        ) {
          return /** skip */
        } else {
          fileTree[item.path] = await API.get_assets({
            path: item.path,
          })
          if (config.enableIncrementalCompilation) {
            skipBuilds.add(item.id, { hash: item.hash })
          }
        }
      }),
    )
    yield `=== 开始复制挂件资源文件 ===`
    const widgetList: DB_block[] = await API.query_sql({
      stmt: `
      SELECT *
      from blocks
      WHERE box = '${book.id}'
      AND type = 'widget'
      limit 150000 OFFSET 0
    `,
    })
    const widgetNode = (
      await Promise.all(
        widgetList.map(async (el) => await get_node_by_id(el.id)),
      )
    )
      .filter(
        (widget) =>
          (widget?.Properties as any)?.['custom-oceanpress-widget-update'],
      )
      .map(async (widget) => {
        if (!widget || !widget?.ID) return
        const update = (widget?.Properties as any)?.[
          'custom-oceanpress-widget-update'
        ] as string
        if (
          config.enableIncrementalCompilation &&
          config.__skipBuilds__[widget.ID]?.updated === update
        ) {
          return /** 资源没有变化，直接跳过 */
        } else {
          const id = widget.ID
          // 快照保存的位置 `/data/storage/oceanpress/widget_img/${id}.jpg`
          fileTree[`assets/widget/${id}.jpg`] = (await API.file_getFile({
            path: `data/storage/oceanpress/widget_img/${id}.jpg`,
          })) as ArrayBuffer
          if (config.enableIncrementalCompilation) {
            skipBuilds.add(id, { updated: update })
          }
        }
      })
    await Promise.all(widgetNode)
  }

  // === 输出编译成果 ===
  if (otherConfig?.onFileTree) {
    otherConfig.onFileTree(fileTree)
  }
  if (config.compressedZip) {
    yield `=== 开始生成压缩包 ===`
    await downloadZIP(fileTree, {
      // TODO 这里应该移出来成为全局的写选项
      withoutZip: config.withoutPublicZip,
      publicZip: config.cdn.publicZip,
    })
  }
  config.OceanPress.version = packageJson.version
  /** 更新跳过编译的资源 */
  skipBuilds.write()
  emit.percentage(100)
  yield '编译完毕'
}


function useSkipBuilds() {
  const obj: { [k: string]: { hash?: string } } = {}
  return {
    add(
      id: string,
      value: { hash?: string; refs?: string[]; updated?: string },
    ) {
      if (obj[id] === undefined) {
        obj[id] = {}
      }
      deepAssign(obj[id], value)
    },
    /** 将缓存的写入到配置文件 */
    write() {
      deepAssign(currentConfig.value.__skipBuilds__, obj)
    },
  }
}
