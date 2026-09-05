<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue';
import { InfoFilled, UploadFilled } from '@element-plus/icons-vue';
import type { UploadFile } from 'element-plus';

import { NativeDecryptWorkerPool } from '@/adapters/NativeDecryptWorkerPool';
import type { DecryptTaskQueue } from '@/application/ports/DecryptTaskQueue';
import { Decrypt } from '@/decrypt';
import type { DecryptResult, FileInfo } from '@/decrypt/entity';
import { storage } from '@/utils/storage';
import { DecryptQueue } from '@/utils/utils';

const emit = defineEmits<{
  success: [result: DecryptResult];
  error: [error: unknown, filename: string];
}>();

const taskAll = shallowRef(0);
const taskFinished = shallowRef(0);
const queue = shallowRef<DecryptTaskQueue>(new DecryptQueue());
const parallel = shallowRef(false);

const progressValue = computed(() => (taskAll.value ? (taskFinished.value / taskAll.value) * 100 : 0));
const progressVisible = computed(() => taskAll.value !== taskFinished.value);

function progressLabel(): string {
  return `${taskFinished.value} / ${taskAll.value}`;
}

function toFileInfo(file: UploadFile): FileInfo {
  if (!file.raw) throw new Error(`无法读取文件：${file.name}`);

  return {
    name: file.name,
    percentage: file.percentage ?? 0,
    raw: file.raw,
    size: file.size ?? file.raw.size,
    status: file.status,
    uid: Number(file.uid),
  };
}

function addFile(uploadFile: UploadFile) {
  taskAll.value += 1;

  queue.value.queue(async (decrypt = Decrypt) => {
    console.info('start handling', uploadFile.name);
    try {
      const file = toFileInfo(uploadFile);
      emit('success', await decrypt(file, await storage.getAll()));
    } catch (error) {
      console.error(error);
      emit('error', error, uploadFile.name);
    } finally {
      taskFinished.value += 1;
    }
  });
}

onMounted(() => {
  if (globalThis.Worker && window.location.protocol !== 'file:') {
    console.info('Using Worker Pool');
    queue.value = new NativeDecryptWorkerPool(navigator.hardwareConcurrency || 1);
    parallel.value = true;
    return;
  }

  console.info('Using Queue in Main Thread');
});

onBeforeUnmount(() => {
  void queue.value.terminate?.();
});
</script>

<template>
  <ElUpload :auto-upload="false" :on-change="addFile" :show-file-list="false" action="#" drag multiple>
    <ElIcon class="upload-icon"><UploadFilled /></ElIcon>
    <div class="el-upload__text">将文件拖到此处，或 <em>点击选择</em></div>
    <template #tip>
      <div class="el-upload__tip">
        <div>
          仅在浏览器内对文件进行解锁，无需消耗流量
          <ElTooltip effect="dark" placement="top-start">
            <template #content>算法在源代码中已经提供，所有运算都发生在本地</template>
            <ElIcon class="info-icon"><InfoFilled /></ElIcon>
          </ElTooltip>
        </div>
        <div>
          工作模式: {{ parallel ? '多线程 Worker' : '单线程 Queue' }}
          <ElTooltip effect="dark" placement="top-start">
            <template #content>
              将此工具部署在 HTTP(S) 环境下，可以启用 Web Worker 特性，<br />
              从而利用并行处理更快地完成解锁。
            </template>
            <ElIcon class="info-icon"><InfoFilled /></ElIcon>
          </ElTooltip>
        </div>
      </div>
    </template>
    <Transition name="el-fade-in">
      <ElProgress
        v-show="progressVisible"
        :format="progressLabel"
        :percentage="progressValue"
        :stroke-width="16"
        :text-inside="true"
        class="decrypt-progress"
      />
    </Transition>
  </ElUpload>
</template>

<style scoped>
.upload-icon {
  margin-bottom: 12px;
  font-size: 56px;
  color: var(--el-text-color-placeholder);
}

.info-icon {
  margin-left: 4px;
  font-size: 12px;
  vertical-align: middle;
}

.decrypt-progress {
  margin: 16px 6px 0;
}
</style>
