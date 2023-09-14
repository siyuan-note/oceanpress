<template>
  <NStep title="选择笔记本" description="选择你需要的笔记本">
    <NRadioGroup>
      <NRadioButton
        v-for="book of notebooks"
        :key="book.id"
        :label="book.name"
        :value="book.id"
        @click="emit('update', book)"
      />
    </NRadioGroup>
  </NStep>
</template>
<script setup lang="ts">
import { NRadioButton, NRadioGroup, NStep } from "naive-ui";
import { notebook } from "@/fs/siyuan_type";
import { toRef } from "vue";

const props = defineProps<{
  notebooks: notebook[];
}>();
const notebooks = toRef(props.notebooks);

const emit = defineEmits<{
  update: [value: notebook];
}>();
</script>
