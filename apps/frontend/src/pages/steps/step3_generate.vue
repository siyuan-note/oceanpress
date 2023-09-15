<template>
  <NStep
    title="开始生成"
    description="点击开始生成后请耐心等待，生成完成后会自动弹出下载"
  >
    <div>
      <NButton
        type="success"
        :loading="percentage > 0 && percentage < 100"
        @click="$emit('generateClick')"
      >
        开始生成
      </NButton>
      <NProgress
        type="line"
        :percentage="percentage"
        :indicator-placement="'inside'"
      />
      <NLog :log="log" language="naive-log" trim />
    </div>
  </NStep>
</template>

<script setup lang="ts">
import { NButton, NLog, NProgress, NStep } from "naive-ui";

withDefaults(defineProps<{ percentage: number; log: string }>(), {
  percentage: 0,
  log: "",
});
defineEmits<{
  generateClick: [];
}>();
</script>

<style scoped></style>
