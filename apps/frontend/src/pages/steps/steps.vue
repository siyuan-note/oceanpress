<script setup lang="ts">
import Config_tab from "~/config/config_tab.vue";
import { currentConfig } from "~/config/index.ts";
import { DocTree, build } from "~/core/build.ts";
import { vApi } from "~/core/siyuan_api.ts";
import { NButton, NInput, NInputGroup, NStep, NSteps } from "naive-ui";
import { computed, ref } from "vue";
import Step1_selectNote from "./step1_selectNote.vue";
import Step2_preview from "./step2_preview.vue";
import Step3_config from "./step3_config.vue";
import Step4_generate from "./step4_generate.vue";

const _notebooks = vApi.notebook_lsNotebooks();
const current = computed(() => {
  let i = 0;
  if (_notebooks.value.fulfilled) i = 2;
  i = 5;
  return i;
});

const percentage = ref(0);
const genHTML_status = ref(false);
const log = ref("");

const docTree = ref<DocTree>({});
async function genHTML(config?: { dir_ref: any }) {
  genHTML_status.value = true;
  log.value = "";
  const res = build(currentConfig.value, config);
  const emitRes = res.next();
  const emit = (await emitRes).value;
  if (emit instanceof Object && !(emit instanceof Error)) {
    emit.percentage = (s) => {
      percentage.value = s;
    };
  }
  for await (const r of res) {
    log.value += r + "\n";
  }

  if (emit instanceof Object && !(emit instanceof Error)) {
    docTree.value = emit.docTree;
    console.log(emit);
  }
  genHTML_status.value = false;
  percentage.value = 100;
}
</script>

<template>
  <Config_tab></Config_tab>
  <NSteps vertical :current="(current as number)" :status="'process'">
    <NStep title="鉴权配置">
      http apiPrefix:
      <NInput
          show-password-on="mousedown"
          placeholder="例如: http:127.0.0.1:6806 "
          v-model:value="currentConfig.apiPrefix"
        />
      authorized:
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
    </NStep>
    <Step1_selectNote
      v-if="_notebooks.fulfilled"
      :notebooks="_notebooks.data.notebooks"
    />
    <Step2_preview />
    <Step3_config />
    <Step4_generate
      :percentage="percentage"
      :log="log"
      @generate-click="genHTML"
      @save-to-disk="(dir_ref) => genHTML({ dir_ref })"
    />
  </NSteps>
</template>
~/core/siyuan_api~/core/build~/core/build
