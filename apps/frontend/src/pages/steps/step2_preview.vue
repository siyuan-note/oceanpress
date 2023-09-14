<template>
  <NStep :title="notebook?.name ?? '未选中'" description="请先选择一个笔记本">
    <Data_loading :p="toRef(filetree)" v-if="notebook">
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
import { continueLoading, usePromiseComputed } from "@/components/data_promise";
import Data_loading from "@/components/data_promise/data_loading.vue";
import { API } from "@/fs/siyuan_api";
import { notebook } from "@/fs/siyuan_type";
import { NList, NListItem, NScrollbar, NStep } from "naive-ui";
import { toRef } from "vue";
const props = defineProps<{
  notebook: notebook;
}>();
const notebook = toRef(props, "notebook");
const filetree = usePromiseComputed.fn(() => {
  if (notebook.value?.id) {
    return API.filetree_listDocsByPath({
      notebook: notebook.value.id,
      path: "/",
    });
  } else {
    return continueLoading;
  }
});
</script>
