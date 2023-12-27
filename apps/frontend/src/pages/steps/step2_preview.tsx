import { defineComponent, ref } from 'vue'
import { NList, NListItem, NScrollbar, NStep } from 'naive-ui'
import {
  continueLoading,
  usePromiseComputed,
} from '~/components/data_promise/index.ts'
import Data_loading from '~/components/data_promise/data_loading.vue'
import { currentConfig } from '~/core/config.ts'
import { API } from '~/core/siyuan_api.ts'

export default defineComponent({
  components: {
    NList,
    NListItem,
    NScrollbar,
    NStep,
    Data_loading,
  },
  setup() {
    const filetree = usePromiseComputed.fn(() => {
      if (currentConfig.value.notebook.id) {
        return API.filetree_listDocsByPath({
          notebook: currentConfig.value.notebook.id,
          path: '/',
        })
      } else {
        return continueLoading
      }
    })

    const toRef = ref

    return {
      filetree,
      toRef,
    }
  },
  render() {
    return (
      <NStep
        title={currentConfig.value.notebook.name ?? '未选中'}
        description="请先选择一个笔记本"
      >
        <Data_loading p={this.toRef(this.filetree)}>
          <NScrollbar style="max-height: 120px" trigger="none">
            <NList hoverable>
              {this.filetree.data.files.map((item) => (
                <NListItem>{item.name}</NListItem>
              ))}
            </NList>
          </NScrollbar>
        </Data_loading>
      </NStep>
    )
  },
})
