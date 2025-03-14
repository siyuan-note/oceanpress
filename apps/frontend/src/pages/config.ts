const search = new URLSearchParams(location.search)

export const model = (search.get('model') as 'siyuan_plugin' | null) || ''

export const isSiyuanPlugin = model === 'siyuan_plugin' || false

console.log('[isSiyuanPlugin]', isSiyuanPlugin)
