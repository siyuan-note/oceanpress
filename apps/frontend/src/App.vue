<template>
  <NModal v-model:show="showModal">
    <NCard style="width: 600px" title="提示" :bordered="false" size="huge" role="dialog" aria-modal="true">
      <h2>未开发完毕，暂不能正常使用</h2>
      <div>
        可关注
        <a href="https://ld246.com/article/1693989505448"> OceanPress_js 版的开发记录 </a>
      </div>
      <div>
        查看生成结果预览
        <a href="/notebook/请从这里开始.html"> 《思源笔记用户指南》： 请从这里开始.html </a>
        <a href="/notebook/请从这里开始/编辑器/排版元素.html"> 《思源笔记用户指南》： 排版元素.html </a>
      </div>

      <template #footer>
        <NButton @click="showModal = false">尝试一下</NButton>
      </template>
    </NCard>
  </NModal>
  <router-view></router-view>
  <div>
    <div>由<a href="https://heartstack.space/user/%E5%AD%90%E8%99%9A">崮生（子虚</a>开发</div>
    <div><a href="https://oceanpress-js.pages.dev">项目地址</a></div>
    <div>
      <a href="https://github.com/2234839/oceanPress_js">开源代码仓库</a>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from "vue";
  import { NModal, NCard, NButton } from "naive-ui";

  const showModal = ref(true);
</script>
