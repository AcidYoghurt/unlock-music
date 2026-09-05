<script setup lang="ts">
import { Delete, Download, Setting } from '@element-plus/icons-vue';

import { FilenamePolicies, type FilenamePolicy } from '@/utils/utils';

defineProps<{
  writesDirectly: boolean;
}>();

const filenamePolicy = defineModel<FilenamePolicy>('filenamePolicy', { required: true });
const instantSave = defineModel<boolean>('instantSave', { required: true });

const emit = defineEmits<{
  openConfig: [];
  downloadAll: [];
  deleteAll: [];
}>();
</script>

<template>
  <div id="app-control">
    <ElRow class="mb-3 controls-row">
      <span>歌曲命名格式：</span>
      <ElRadio v-for="policy in FilenamePolicies" :key="policy.key" v-model="filenamePolicy" :value="policy.key">
        {{ policy.text }}
      </ElRadio>
    </ElRow>

    <ElRow class="controls-row">
      <ElTooltip content="部分解密方案需要设定解密参数。" effect="dark" placement="top">
        <ElButton :icon="Setting" plain @click="emit('openConfig')">解密设定</ElButton>
      </ElTooltip>
      <ElButton :icon="Download" plain @click="emit('downloadAll')">下载全部</ElButton>
      <ElButton :icon="Delete" plain type="danger" @click="emit('deleteAll')">清除全部</ElButton>

      <ElTooltip effect="dark" placement="top-start">
        <template #content>
          <span v-if="instantSave">工作模式: {{ writesDirectly ? '写入本地文件系统' : '调用浏览器下载' }}</span>
          <span v-else>
            批量解锁时建议开启此选项。<br />
            开启后，解锁结果不会保留在浏览器中，可减少内存占用。
          </span>
        </template>
        <ElCheckbox v-model="instantSave" border class="ml-2">立即保存</ElCheckbox>
      </ElTooltip>
    </ElRow>
  </div>
</template>

<style scoped>
.controls-row {
  align-items: center;
  gap: 8px;
}
</style>
