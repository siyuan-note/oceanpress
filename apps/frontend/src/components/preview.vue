<template>
  <n-tree
    block-line
    @update:checked-keys="updateCheckedKeys"
    :data="data"
    checkable
    selectable
  />
  <iframe :src="'./#preview' + path" frameborder="0"></iframe>
</template>
<script setup lang="ts">
import { NTree, TreeOption } from "naive-ui";
import { docTree } from "../fs/build";
import { computed, ref } from "vue";
const props = defineProps<{
  docTree: docTree;
}>();
const path = ref("");
function updateCheckedKeys(
  keys: Array<string | number>,
  options: Array<TreeOption | null>,
  meta: {
    node: TreeOption | null;
    action: "check" | "uncheck";
  }
) {
  path.value = keys[0] as string;
  console.log("updateCheckedKeys", keys, options, meta);
}
const data = computed(() => {
  return Object.keys(props.docTree).map((key) => {
    return {
      label: key,
      key,
      //   children: props.docTree[key],
    };
  });
});
</script>
