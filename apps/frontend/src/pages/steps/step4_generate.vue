<template>
  <NStep title="开始生成" description="点击开始生成后请耐心等待，生成完成后会自动弹出下载">
    <div>
      <NButton
        type="success"
        :loading="percentage > 0 && percentage < 100"
        @click="$emit('generateClick')"
      >
        开始生成
      </NButton>
      <NButton
        :disabled="!isShowDirectoryPickerSupported"
        type="success"
        :loading="percentage > 0 && percentage < 100"
        @click="saveToDisk"
        title="这需要您的浏览器支持 showDirectoryPicker ，这是一个很新的浏览器 api。 chrome、edge 的新版本提供此api"
      >
        保存到本地磁盘
      </NButton>
      <NProgress type="line" :percentage="percentage" :indicator-placement="'inside'" />
      <NLog :log="log" language="naive-log" trim />
    </div>
  </NStep>
</template>

<script setup lang="ts">
  import { NButton, NLog, NProgress, NStep } from "naive-ui";
  import { computed } from "vue";

  withDefaults(defineProps<{ percentage: number; log: string }>(), {
    percentage: 0,
    log: "",
  });
  const emit = defineEmits<{
    generateClick: [];
    saveToDisk: [dirRef: any];
  }>();
  const isShowDirectoryPickerSupported = computed(() => {
    return "showDirectoryPicker" in globalThis;
  });
  /** 此为实验性api */
  async function saveToDisk() {
    //@ts-ignore
    const dir_ref = await showDirectoryPicker();
    if (!dir_ref) {
      console.log("showDirectoryPicker() 未返回有效值");

      // User cancelled, or otherwise failed to open a directory.
      return;
    }
    emit("saveToDisk", dir_ref);
  }
</script>

<style scoped></style>
