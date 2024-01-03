import { defineComponent, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { configs } from '~/core/config.ts'
const preview = defineComponent({
  setup() {
    const route = useRoute()
    const path = route.params.path as string
    const iframeHref = ref<string | null>(null)
    // firefox 不兼容
    navigator.serviceWorker
      .register(import.meta.env.PROD ? 'sw.iife.js' : '/sw.ts', {
        scope: '/',
      })
      .then(async (_r) => {
        const configStatus = await (
          await fetch('/preview/page/configs', {
            body: JSON.stringify(configs),
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
          })
        ).json()
        console.log('configStatus', configStatus)
        iframeHref.value = `/preview/page/${path}`
      })
      .catch((e) => {
        console.log(e)
      })
    const myElement = ref<HTMLIFrameElement | null>(null)
    watchEffect(async () => {
      if (!myElement.value) return
      //   const honoApp = createHonoApp()

      //   const r = honoApp.request(path) as Promise<Response>
      //   const html = await (await r).text()
      //   myElement.value.contentDocument!.body.innerHTML = html
    })

    return () => (
      <>
        <h4 style="color:#3c">预览界面</h4>
        <iframe
          ref={myElement}
          src={iframeHref.value ?? ''}
          style="width:100%;height:700px;border:none;"
        ></iframe>
      </>
    )
  },
})
export default preview
