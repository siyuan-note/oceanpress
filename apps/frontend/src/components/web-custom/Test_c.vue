<script setup lang="ts">
  import { watchEffect } from "vue";
  import { aElement } from "./store";

  watchEffect(() => {
    aElement.forEach((el) => {
      console.log(el.href);
    });
  });
</script>
<template>
  <iframe v-for="(el, index) in aElement" :key="index" class="flow" :src="el.href"></iframe>
</template>
<style>
  .flow {
    position: absolute;
    left: 0px;
    top: 1000px;
  }
</style>
