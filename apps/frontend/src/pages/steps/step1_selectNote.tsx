import { NRadioButton, NRadioGroup, NStep } from 'naive-ui'
import { computed, defineComponent, toRef } from 'vue'
import { currentConfig } from '~/core/config.ts'
import type { notebook } from '~/core/siyuan_type.ts'

export default defineComponent({
  props: {
    notebooks: {
      type: Array as () => notebook[],
      required: true,
    },
  },
  setup(props) {
    const value = computed({
      get: () => currentConfig.value.notebook.id,
      set: (id: string) => {
        Object.assign(
          currentConfig.value.notebook,
          props.notebooks.find((book) => book.id === id),
        )
      },
    })
    const notebooks = toRef(props, 'notebooks')

    return {
      value,
      notebooks,
    }
  },
  render() {
    return (
      <NStep title="选择笔记本" description="选择你需要的笔记本">
        <NRadioGroup v-model:value={this.value}>
          {this.notebooks.map((book) => (
            <NRadioButton key={book.id} label={book.name} value={book.id} />
          ))}
        </NRadioGroup>
      </NStep>
    )
  },
})
