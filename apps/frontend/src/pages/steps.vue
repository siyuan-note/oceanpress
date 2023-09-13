<script setup lang="ts">
import dataLoading from "@/components/data_promise/data_loading.vue";
import preview from "@/components/preview.vue";

import { continueLoading, usePromiseComputed } from "@/components/data_promise";
import { vApi, API, setAuthorizedToken } from "@/fs/siyuan_api";
import { notebook } from "@/fs/siyuan_type";
import { computed, ref, toRef, watchEffect } from "vue";
import { currentConfig } from "@/config/";
import {
  NListItem,
  NList,
  NScrollbar,
  NSteps,
  NStep,
  NRadioGroup,
  NRadioButton,
  NProgress,
  NLog,
  NButton,
  NInput,
  NInputGroup,
  NAlert,
} from "naive-ui";
import { build } from "@/fs/build";
import { docTree } from "@/fs/build";
import { reqStore, sendTreatmentResults } from "@/util/event";

watchEffect(() => setAuthorizedToken(currentConfig.value.authorized));
const _notebooks = vApi.notebook_lsNotebooks();
const showAuthorizedWarn = computed(() => {
  return _notebooks.value.fulfilled && currentConfig.value.authorized === "";
});
const inputAuthorized = computed(() => {
  return (
    _notebooks.value.rejected &&
    _notebooks.value.error.message.concat("鉴权失败")
  );
});

const currentNoteBook = usePromiseComputed<notebook>({});
const filetree = usePromiseComputed.fn(() => {
  if (currentNoteBook.value.fulfilled) {
    return API.filetree_listDocsByPath({
      notebook: currentNoteBook.value.data.id,
      path: "/",
    });
  } else {
    return continueLoading;
  }
});
const current = computed(() => {
  let i = 0;
  if (_notebooks.value.fulfilled) {
    i = 1;
  }
  if (currentNoteBook.value.fulfilled) {
    i = 4;
  }
  return i;
});

const percentage = ref(0);
const genHTML_status = ref(false);
const log = ref("");

const docTree = ref<docTree>({});
async function genHTML(book: notebook) {
  genHTML_status.value = true;

  const res = build(book);
  const emitRes = res.next();
  const emit = (await emitRes).value;
  for await (const r of res) {
    log.value += r + "\n";
  }

  if (emit instanceof Object) {
    docTree.value = emit.docTree;
    console.log(emit);
  }
  genHTML_status.value = false;
  percentage.value = 100;
}
// function getHtmlByPath(path: string) {
//   return docTree.value[path].docHTML;
// }
watchEffect(() => {
  console.log("接收到请求事件", reqStore.preview);
  if (reqStore.preview) {
    console.log(reqStore);

    sendTreatmentResults("preview", docTree.value[reqStore.preview].docHTML);
  }
});
</script>

<template>
  <n-steps vertical :current="(current as number)" :status="'process'">
    <n-step title="选择笔记本" description="选择你需要的笔记本">
      <dataLoading :p="toRef(_notebooks)">
        <template #err>
          <n-input-group v-if="inputAuthorized">
            <n-input
              type="password"
              show-password-on="mousedown"
              placeholder="输入：siyuan-设置-关于-API授权码"
              v-model:value="currentConfig.authorized"
            />
            <n-button type="primary" ghost @click="_notebooks.reLoad">
              确定
            </n-button>
          </n-input-group>
        </template>
        <n-alert
          v-if="showAuthorizedWarn"
          title="存在安全风险"
          type="warning"
          style="max-width: 400px"
        >
          看起来您似乎没有开启siyuan访问授权，这会导致您的数据可能被他人获取，建议您开启授权码。
          <hr />
          在没有开启的情况下，任意一个网页都能访问您的数据，包括您的笔记内容。
          <hr />
          例如本页面在没有授权的情况下获取到了您的笔记本名称，事实上可以读取siyuan的任意内容。
        </n-alert>
        <n-radio-group
          v-model:value="currentNoteBook.data.id"
          name="radiobuttongroup1"
        >
          <n-radio-button
            v-for="book of _notebooks.data.notebooks"
            :key="book.id"
            :label="book.name"
            :value="book.id"
            @click="currentNoteBook.setValue(book)"
          />
        </n-radio-group>
      </dataLoading>
    </n-step>
    <n-step
      :title="currentNoteBook.data.name ?? '未选中'"
      description="请先选择一个笔记本"
    >
      <dataLoading :p="toRef(filetree)" v-if="currentNoteBook.fulfilled">
        <n-scrollbar style="max-height: 120px" trigger="none">
          <n-list hoverable>
            <n-list-item v-for="item of filetree.data.files">
              {{ item.name }}
            </n-list-item>
          </n-list>
        </n-scrollbar>
      </dataLoading>
    </n-step>
    <n-step title="其他配置"></n-step>
    <n-step
      title="Something"
      description="Something in the way she moves Attracts me like no other lover"
    >
      <div v-if="current === 4">
        <n-button
          type="success"
          :loading="genHTML_status"
          @click="() => genHTML(currentNoteBook.data)"
        >
          开始生成
        </n-button>
        <n-progress
          type="line"
          :percentage="percentage"
          :indicator-placement="'inside'"
        />
        <preview :doc-tree="docTree" />
        <n-log :log="log" language="naive-log" trim />
      </div>
    </n-step>
  </n-steps>
</template>
