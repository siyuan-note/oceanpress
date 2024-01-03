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
import { OceanPress } from '~/core/ocean_press.ts'

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
    async function genHTML(otherConfig?: {
      /** 实验性api https://github.com/WICG/file-system-access/blob/main/EXPLAINER.md */
      dir_ref: any
    }) {
      genHTML_status.value = true
      log.value = ''

      const ocean_press = new OceanPress(currentConfig.value)

      // 浏览器端写磁盘插件
      if (otherConfig?.dir_ref) {
        ocean_press.pluginCenter.registerPlugin({
          build_onFileTree([tree]) {
            writeFileSystem(tree, otherConfig.dir_ref)
          },
        })
      }

      let res: ReturnType<typeof build> = await ocean_press.build()
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
        <NSteps vertical current={current.value} status={'process'} >
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

/** chrome系高版本可用 */
async function writeFileSystem(
  fileTree: { [htmlPath: string]: string | ArrayBuffer },
  dir_ref: any,
) {
  /** 并发写文件 */
  await Promise.all(
    Object.entries(fileTree).map(async ([path, html]) => {
      await writeFile(dir_ref, path, html).catch((e) => {
        console.log(e, dir_ref)
      })
    }),
  )
  async function writeFile(
    dir_ref: any,
    name: string,
    data: string | ArrayBuffer,
  ) {
    const pathArr = name.split('/')
    /** 如果路径中的目录不存在则创建 */
    if (pathArr.length > 1) {
      for (let i = 0; i < pathArr.length - 1; i++) {
        const dirName = pathArr[i]
        if (dirName === '') {
          continue
        }
        dir_ref = await dir_ref.getDirectoryHandle(dirName, { create: true })
      }
    }
    /** 写文件 */
    const new_file = await dir_ref.getFileHandle(pathArr[pathArr.length - 1], {
      create: true,
    })
    const new_file_writer = await new_file.createWritable()
    await new_file_writer.write(data)
    await new_file_writer.close()
  }
}
