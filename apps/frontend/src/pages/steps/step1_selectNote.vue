<template>
  <NStep title="选择笔记本" description="选择你需要的笔记本">
    <NRadioGroup v-model:value="value">
      <NRadioButton
        v-for="book of notebooks"
        :key="book.id"
        :label="book.name"
        :value="book.id"
      />
    </NRadioGroup>
  </NStep>
</template>
<script setup lang="ts">
import { NRadioButton, NRadioGroup, NStep } from "naive-ui";
import type { notebook } from "@/core/siyuan_type.ts";
import { computed, toRef } from "vue";
import { currentConfig } from "@/config/index.ts";
const value = computed({
  get: () => currentConfig.value.notebook.id,
  set: (id: string) => {
    Object.assign(
      currentConfig.value.notebook,
      notebooks.value.find((book) => book.id === id),
    );
  },
});
const props = defineProps<{
  notebooks: notebook[];
}>();
const notebooks = toRef(props.notebooks);
</script>
@/core/siyuan_type
