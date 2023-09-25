<script setup lang="ts">
  import { NButton, NCard, NInput, NModal, NTabPane, NTabs, useMessage } from "naive-ui";
  import { configs, addConfig } from ".";
  import { computed, ref } from "vue";
  const message = useMessage();

  const tabs = computed(() => {
    return Object.entries(configs)
      .filter(([key, vlaue]) => {
        if (key.startsWith("__")) return false;
        else if (typeof vlaue === "object") {
          return true;
        } else {
          return false;
        }
      })
      .map(([key, value]) => {
        return { key, value };
      });
  });

  const showModal = ref(false);
  const name = ref("");
  function add() {
    if (name.value === "") {
      message.warning("名称不能为空");
    } else if (name.value in configs) {
      message.warning("不能和已有的配置项重名");
    } else {
      addConfig(name.value);
      showModal.value = false;
    }
  }
  function validateInput(value: string) {
    if (value.startsWith("__")) {
      message.warning("名称不能以双下划线开头");
      return false;
    }
    return true;
  }
</script>
<template>
  <NTabs
    v-model:value="configs.__current__"
    type="card"
    animated
    addable
    closable
    @add="showModal = true"
    @close="(key) => delete configs[key]"
  >
    <NTabPane :name="el.key" :tab="el.key" v-for="el of tabs"> {{ el.key }} </NTabPane>
  </NTabs>
  <NModal v-model:show="showModal">
    <NCard
      style="width: 600px"
      title="输入配置名"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <NInput
        v-model:value="name"
        placeholder="输入配置名"
        maxlength="30"
        show-count
        clearable
        :allow-input="validateInput"
      />
      不能以双下划线（__）开头、也不能为空、不能和已有的配置项重名
      <template #footer> <NButton @click="add">确认</NButton> </template>
    </NCard>
  </NModal>
</template>
