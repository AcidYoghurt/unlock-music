<script setup lang="ts">
import { Delete, Download, Edit, VideoPlay } from '@element-plus/icons-vue';

import type { DecryptResult } from '@/decrypt/entity';

defineProps<{
  tableData: readonly DecryptResult[];
}>();

const emit = defineEmits<{
  play: [url: string];
  download: [track: DecryptResult];
  edit: [track: DecryptResult];
  remove: [fileUrl: string];
}>();
</script>

<template>
  <ElTable :data="tableData" class="music-table">
    <ElTableColumn label="封面">
      <template #default="scope">
        <ElImage :src="scope.row.picture" class="cover-image">
          <template #error>
            <div class="image-slot el-image__error">暂无封面</div>
          </template>
        </ElImage>
      </template>
    </ElTableColumn>
    <ElTableColumn label="歌曲">
      <template #default="scope">
        <p>{{ scope.row.title }}</p>
      </template>
    </ElTableColumn>
    <ElTableColumn label="歌手">
      <template #default="scope">
        <p>{{ scope.row.artist }}</p>
      </template>
    </ElTableColumn>
    <ElTableColumn label="专辑">
      <template #default="scope">
        <p>{{ scope.row.album }}</p>
      </template>
    </ElTableColumn>
    <ElTableColumn label="操作">
      <template #default="scope">
        <ElButton :icon="VideoPlay" circle type="success" @click="emit('play', scope.row.file)" />
        <ElButton :icon="Download" circle @click="emit('download', scope.row)" />
        <ElButton :icon="Edit" circle @click="emit('edit', scope.row)" />
        <ElButton :icon="Delete" circle type="danger" @click="emit('remove', scope.row.file)" />
      </template>
    </ElTableColumn>
  </ElTable>
</template>

<style scoped>
.music-table {
  width: 100%;
}

.cover-image {
  width: 100px;
  height: 100px;
}
</style>
