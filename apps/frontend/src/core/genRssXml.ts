import { get_node_by_id } from './cache.ts'
import type { Config } from './config.ts'
import type { Render } from './render.ts'
import type { DB_block, S_Node } from './siyuan_type.ts'

/** 生成当前实例所有引用文档的RSS XML */
export async function generateRSSXML(
  path: string,
  renderInstance: Render,
  config: Config,
  getHPathByID_Node: (id_node: string | S_Node) => Promise<string>,
): Promise<string> {
  const refNode = (
    await Promise.all([...renderInstance.refs.values()].map(get_node_by_id))
  ).filter((el) => el)

  return `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
  <title>${config.sitemap.title}</title>
  <link>${config.sitemap.siteLink}</link>
  <description>${config.sitemap.description}</description>
  <atom:link href="${
    config.sitemap.sitePrefix
  }${path}" rel="self" type="application/rss+xml"/>
  <lastBuildDate>${new Date().toISOString()}</lastBuildDate>
  ${(
    await Promise.all(
      refNode.map(
        async (node) => `<item>
    <title>${node?.Properties?.title}</title>
    <link>${config.sitemap.sitePrefix}${
          node?.ID ? (await getHPathByID_Node(node?.ID)) + '.html' : ''
        }</link>
    <description>${'' /** TODO 或许可以加入ai 进行摘要 */}</description>
    <pubDate>${
      node?.Properties?.updated
        ? new Date(
            node.Properties.updated.replace(
              /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
              '$1/$2/$3 $4:$5:$6',
            ),
          ).toISOString()
        : ''
    }</pubDate>
  </item>`,
      ),
    )
  ).join('\n')}
  </channel>
  </rss>`
}

/** 生成 sitemap.xml 文件内容  */
export function sitemap_xml(
  docArr: DB_block[],
  config: {
    sitePrefix: string
  },
) {
  const urlList: string = docArr
    .map((doc) => {
      let lastmod = ''
      const time = doc.ial.match(/updated=\"(\d+)\"/)?.[1] ?? doc.created
      if (time) {
        lastmod = `\n<lastmod>${time.slice(0, 4)}-${time.slice(
          4,
          6,
        )}-${time.slice(6, 8)}</lastmod>`
      }
      return `<url>
  <loc>${config.sitePrefix}${doc.hpath}.html</loc>${lastmod}
  </url>\n`
    })
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlList}
  </urlset>`
}
