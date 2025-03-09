import JSZip from 'jszip'

/** 下载zip */
export async function downloadZIP(
  docTree: { [htmlPath: string]: string | ArrayBuffer },
  config?: { publicZip?: string; withoutZip?: boolean },
) {
  const content = await genZIP(docTree, config)
  if (globalThis.document) {
    // 将ZIP文件保存为下载
    const link = document.createElement('a')
    link.href = URL.createObjectURL(content)
    link.download = `notebook.zip`
    link.click()
  } else {
    //TODO node 环境下需要写文件
  }
}

export async function genZIP(
  docTree: { [htmlPath: string]: string | ArrayBuffer },
  config?: {
    /** 默认的public.zip压缩包内容路径，默认为/public.zip  */
    publicZip?: string
    /** 是否不包含默认的public.zip压缩包内容,设置为 true 则会不下载 public.zip 内容合并使用 */
    withoutZip?: boolean
  },
) {
  const zip = new JSZip()
  if (config?.withoutZip !== true) {
    const presetZip = await (
      await fetch(config?.publicZip ?? '/public.zip')
    ).arrayBuffer()
    await zip.loadAsync(presetZip)
  }
  for (const [path, html] of Object.entries(docTree)) {
    zip.file(path, html)
  }
  return await zip.generateAsync({ type: 'blob' })
}
