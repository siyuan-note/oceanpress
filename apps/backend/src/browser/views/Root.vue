<template>
  {{ text }}
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';
import { API } from '../../common/rpc/rpc';
const text = ref("loading...")

API.currentTime2(true).then(r => {
  text.value = "" + r
})
watchEffect(() => console.log(text.value))
</script>
