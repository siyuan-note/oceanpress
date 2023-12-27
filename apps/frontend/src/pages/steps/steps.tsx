import Config_tab from '~/pages/config_tab.tsx'
import { currentConfig } from '~/core/config.ts'
import { DocTree, build } from '~/core/build.ts'
import { vApi } from '~/core/siyuan_api.ts'
import { NButton, NInput, NInputGroup, NStep, NSteps } from 'naive-ui'
import { computed, defineComponent, ref } from 'vue'
import Step1_selectNote from './step1_selectNote.tsx'
import Step2_preview from './step2_preview.tsx'
import Step3_config from './step3_config.tsx'
import Step4_generate from './step4_generate.tsx'

export default defineComponent({
  setup() {
    const _notebooks = vApi.notebook_lsNotebooks()
    const current = computed(() => {
      let i = 0
      if (_notebooks.value.fulfilled) i = 2
      i = 5
      return i
    })

    const percentage = ref(0)
    const genHTML_status = ref(false)
    const log = ref('')

    const docTree = ref<DocTree>({})
    async function genHTML(config?: { dir_ref: any }) {
      console.log(333)

      genHTML_status.value = true
      log.value = ''
      const res = build(currentConfig.value, config)
      const emitRes = res.next()
      const emit = (await emitRes).value
      if (emit instanceof Object && !(emit instanceof Error)) {
        emit.percentage = (s) => {
          percentage.value = s
        }
      }
      for await (const r of res) {
        log.value += r + '\n'
      }

      if (emit instanceof Object && !(emit instanceof Error)) {
        docTree.value = emit.docTree
        console.log(emit)
      }
      genHTML_status.value = false
      percentage.value = 100
    }
    return () => (
      <>
        <Config_tab></Config_tab>
        <NSteps vertical current={current.value} status={'process'}>
          <NStep title="鉴权配置">
            http apiPrefix:
            <NInput
              show-password-on="mousedown"
              placeholder="例如: http:127.0.0.1:6806"
              v-model:value={currentConfig.value.apiPrefix}
            />
            authorized:
            <NInputGroup>
              <NInput
                type="password"
                show-password-on="mousedown"
                placeholder="输入：siyuan-设置-关于-API授权码"
                v-model:value={currentConfig.value.authorized}
              />
              <NButton type="primary" ghost onClick={_notebooks.value.reLoad}>
                确定
              </NButton>
            </NInputGroup>
          </NStep>
          {_notebooks.value.fulfilled && (
            <Step1_selectNote notebooks={_notebooks.value.data.notebooks} />
          )}
          <Step2_preview />
          <Step3_config />
          <Step4_generate
            percentage={percentage.value}
            log={log.value}
            onGenerateClick={() => genHTML()}
            onSaveToDisk={(dir_ref: any) => genHTML({ dir_ref })}
          />
        </NSteps>
      </>
    )
  },
})
