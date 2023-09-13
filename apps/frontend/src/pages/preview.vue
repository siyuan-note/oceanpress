<template>预览页面 {{ resStore.preview }}</template>
<script setup lang="ts">
import { sendRequestMessage, resStore } from "@/util/event";
import { watchEffect } from "vue";

const props = defineProps<{
  path: String;
}>();
watchEffect(() => {
  console.log(props.path, resStore.preview);
});

sendRequestMessage("preview", "/" + props.path);
</script>
