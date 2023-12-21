import { ref, watchEffect } from 'vue'

export default {
  setup() {
    const iframe = ref<HTMLIFrameElement | null>(null)
    const height = ref<string>('100px')
    watchEffect(() => {
      if (!iframe.value) return
      const domIframe = iframe.value
      const dom = domIframe.contentDocument!
      console.log(dom.readyState)

      domIframe.onload = function () {
        console.log(domIframe.contentDocument)
        const targetBlock = domIframe.contentDocument!.getElementById(
          '20210528115021-oj6gzg7',
        )
        // 在这里可以访问正确的文档对象
        console.log(dom, targetBlock, targetBlock?.clientHeight)
        height.value = String(targetBlock?.clientHeight || 100) + 'px'
      }
    })
    return {
      iframe,
      height,
    }
  },

  mounted() {},
}
