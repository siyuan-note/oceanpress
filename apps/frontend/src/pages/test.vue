<template>
  <NButton @click="copy(code.data)">复制</NButton>
  <NButton @click="copy(JSON.stringify(sy.data))">复制原始</NButton>
  <NButton @click="sy.reLoad">reLoad</NButton>

  <iframe style="width: 80vw; height: 70vh" :src="'/notebook/test.html?t=' + Date.now()"></iframe>
</template>
<script setup lang="ts">
  import { htmlTemplate } from "@/fs/htmlTemplate";
  import { vApi } from "@/fs/siyuan_api";
  import { NButton } from "naive-ui";
  import { useDebouncedRef, usePromiseComputed } from "@/components/data_promise";
  import { renderHTML } from "@/fs/render";
  import { watchEffect } from "vue";
  import { writeFile } from "@/util/writeFile";
  import { S_Node } from "@/fs/siyuan_type";
  const sy = vApi.file_getFile({
    /** 排版元素 */
    // path: "data/20210808180117-czj9bvb/20200812220555-lj3enxa/20210808180320-abz7w6k/20200825162036-4dx365o.sy",
    /** 请从这里开始 20200812220555-lj3enxa.sy */
    path: "data/20210808180117-czj9bvb/20200812220555-lj3enxa.sy",
    /** 窗口和页签 */
    // path: "data/20210808180117-czj9bvb/20200812220555-lj3enxa/20210808180321-hbvl5c2/20200822191536-rm6hwid.sy",
  });
  const code = usePromiseComputed.fn(async () => {
    const testConfig = {
      /** 思源 js、css等文件的前缀 */
      siyuanPrefix:
        "https://cdn.jsdelivr.net/gh/2234839/oceanPress_js@main/apps/frontend/public/notebook/",
    };
    if (sy.value.fulfilled) {
      return await htmlTemplate(
        {
          htmlContent: await renderHTML(sy.value.data as S_Node),
          level: 0,
          title: "测试用页面",
        },
        testConfig,
      );
    } else {
      return "<not fetch>";
    }
  });
  const debounceCode = useDebouncedRef("");
  watchEffect(() => (debounceCode.value = code.value.data));
  watchEffect(() => {
    writeFile({
      path: "D:/code/oceanPress_js/apps/frontend/public/notebook/test.html",
      data: debounceCode.value,
    });
  });
  function copy(textToCopy: string) {
    navigator.clipboard.writeText(textToCopy);
  }
</script>
