<script setup lang="ts">
import { Ref } from "vue";
import { PromiseObj } from "./";
import { NSpace, NSpin, NButton, NButtonGroup, NAlert } from "naive-ui";
const props = defineProps<{
  p: Ref<PromiseObj<unknown, Error>>;
}>();
</script>

<template>
  <n-space>
    <n-spin v-if="props.p.value.pending" size="large" />
    <n-alert v-else-if="props.p.value.rejected" title="Error" type="error">
      {{ props.p.value.error }}
      <slot name="err"></slot>
    </n-alert>
    <slot v-else> 无数据显示 </slot>
    <n-button-group v-if="!props.p.value.pending" size="small">
      <n-button @click="props.p.value.reLoad()">
        <template #icon> 🔄 </template>
        重载
      </n-button>
    </n-button-group>
  </n-space>
</template>
