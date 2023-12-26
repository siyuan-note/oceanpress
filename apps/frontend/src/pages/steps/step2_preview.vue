<template>
  <NStep
    :title="(currentConfig.notebook.name ?? '未选中')+' - 预览'"
    description="请先选择一个笔记本"
  >
    <Data_loading :p="toRef(filetree)">
      <NScrollbar style="max-height: 120px" trigger="none">
        <NList hoverable>
          <NListItem v-for="item of filetree.data.files">
            {{ item.name }}
          </NListItem>
        </NList>
      </NScrollbar>
    </Data_loading>
  </NStep>
</template>
<script setup lang="ts">
import { continueLoading, usePromiseComputed } from "~/components/data_promise/index.ts";
import Data_loading from "~/components/data_promise/data_loading.vue";
import { currentConfig } from "~/config/index.ts";
import { API } from "~/core/siyuan_api.ts";
import { NList, NListItem, NScrollbar, NStep } from "naive-ui";
import { toRef } from "vue";

const filetree = usePromiseComputed.fn(() => {
  if (currentConfig.value.notebook.id) {
    return API.filetree_listDocsByPath({
      notebook: currentConfig.value.notebook.id,
      path: "/",
    });
  } else {
    return continueLoading;
  }
});
</script>
~/core/siyuan_api
