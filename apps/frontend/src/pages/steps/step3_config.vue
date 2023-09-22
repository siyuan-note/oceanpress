<template>
  <NStep title="其他配置">
    <NCollapse>
      <NCollapseItem title="zip打包选项" name="1" style="text-align: start">
        <NCheckbox v-model:checked="currentConfig.compressedZip">
          打包成 zip(在浏览器端打包完毕后会弹出保存对话窗口)
        </NCheckbox>
        <NDivider />
        <NCheckbox v-model:checked="currentConfig.withoutPublicZip">
          不打包appearance、stage
          等公共资源（开启了cdn就选这个不打包，<br>
          这些资源将近19mb「下载只需要6~7mb」，<br>
          当然你如果自行部署的话也可以选这个不打包来节省时间，<br>
          这些资源一般没有变化所以部署一次即可。）
        </NCheckbox>
        <NDivider />
        <NCheckbox v-model:checked="currentConfig.excludeAssetsCopy">
          不复制 assets/ 资源，勾选此选项则需要自行处理资源文件
        </NCheckbox>
      </NCollapseItem>
      <NCollapseItem title="CDN 配置" name="2">
        公共资源的cdn前缀<br>
        删除掉下方文本框内所有文本即关闭了此功能<br>
        <NInput
          v-model:value="currentConfig.cdn.siyuanPrefix"
          type="textarea"
          placeholder="公共资源的cdn前缀"
        />
      </NCollapseItem>
    </NCollapse>
  </NStep>
</template>
<script setup lang="ts">
  import { currentConfig } from "@/config";
  import { NCheckbox, NCollapse, NCollapseItem, NDivider, NInput, NStep } from "naive-ui";
  currentConfig;
</script>
