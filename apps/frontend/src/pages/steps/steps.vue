<script setup lang="ts">
import { usePromiseComputed } from "@/components/data_promise";
import { vApi } from "@/fs/siyuan_api";
import { notebook } from "@/fs/siyuan_type";
import { computed, ref } from "vue";
import { currentConfig } from "@/config/";
import {
  NSteps,
  NStep,
  NProgress,
  NLog,
  NButton,
  NInputGroup,
  NInput,
  NAlert,
} from "naive-ui";
import { build } from "@/fs/build";
import { docTree } from "@/fs/build";
import Step1_selectNote from "./step1_selectNote.vue";
import Step2_preview from "./step2_preview.vue";

const _notebooks = vApi.notebook_lsNotebooks();
const currentNoteBook = usePromiseComputed<notebook>({});

const current = computed(() => {
  let i = 0;
  if (_notebooks.value.fulfilled) {
    i = 2;
  }
  if (currentNoteBook.value.fulfilled) {
    i = 5;
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
</script>

<template>
  <NSteps vertical :current="(current as number)" :status="'process'">
    <NStep title="鉴权配置">
      <NInputGroup>
        <NInput
          type="password"
          show-password-on="mousedown"
          placeholder="输入：siyuan-设置-关于-API授权码"
          v-model:value="currentConfig.authorized"
        />
        <NButton type="primary" ghost @click="_notebooks.reLoad">
          确定
        </NButton>
      </NInputGroup>
      <NAlert
        v-if="currentConfig.authorized === ''"
        title="存在安全风险"
        type="warning"
        style="max-width: 400px"
      >
        看起来您似乎没有开启siyuan访问授权，这会导致您的数据可能被他人获取，建议您开启授权码。
        <hr />
        在没有开启的情况下，任意一个网页都能访问您的数据，包括您的笔记内容。
        <hr />
        例如本页面在没有授权的情况下获取到了您的笔记本名称，事实上可以读取siyuan的任意内容。
      </NAlert>
    </NStep>
    <Step1_selectNote
      v-if="_notebooks.fulfilled"
      :notebooks="_notebooks.data.notebooks"
      @update="currentNoteBook.setValue"
    />
    <Step2_preview :notebook="currentNoteBook.data"></Step2_preview>
    <n-step title="其他配置"></n-step>
    <n-step
      title="开始生成"
      description="点击开始生成后请耐心等待，生成完成后会自动弹出下载"
    >
      <div v-if="current === 5">
        <NButton
          type="success"
          :loading="genHTML_status"
          @click="() => genHTML(currentNoteBook.data)"
        >
          开始生成
        </NButton>
        <n-progress
          type="line"
          :percentage="percentage"
          :indicator-placement="'inside'"
        />
        <n-log :log="log" language="naive-log" trim />
      </div>
    </n-step>
  </NSteps>
</template>
