<script setup lang="ts">
  import { vApi } from "@/fs/siyuan_api";
  import { computed, ref } from "vue";
  import { currentConfig } from "@/config/";
  import { NSteps, NStep, NButton, NInputGroup, NInput, NAlert } from "naive-ui";
  import { build } from "@/fs/build";
  import { DocTree } from "@/fs/build";
  import Step1_selectNote from "./step1_selectNote.vue";
  import Step2_preview from "./step2_preview.vue";
  import Step4_generate from "./step4_generate.vue";
  import Step3_config from "./step3_config.vue";
  import Config_tab from "@/config/config_tab.vue";

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
    if (emit instanceof Object) {
      emit.percentage = (s) => {
        percentage.value = s;
      };
    }
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
  <Config_tab></Config_tab>
  <NSteps vertical :current="(current as number)" :status="'process'">
    <NStep title="鉴权配置">
      <NInputGroup>
        <NInput
          type="password"
          show-password-on="mousedown"
          placeholder="输入：siyuan-设置-关于-API授权码"
          v-model:value="currentConfig.authorized"
        />
        <NButton type="primary" ghost @click="_notebooks.reLoad"> 确定 </NButton>
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
    <Step1_selectNote v-if="_notebooks.fulfilled" :notebooks="_notebooks.data.notebooks" />
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
