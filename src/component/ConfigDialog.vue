<script setup lang="ts">
import { reactive, shallowRef, useTemplateRef, watch } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';

import { storage } from '@/utils/storage';
import Ruby from './Ruby.vue';

interface ConfigForm {
  jooxUUID: string;
}

const visible = defineModel<boolean>({ required: true });
const formRef = useTemplateRef<FormInstance>('formRef');
const saving = shallowRef(false);
const form = reactive<ConfigForm>({ jooxUUID: '' });

const rules: FormRules<ConfigForm> = {
  jooxUUID: [
    { required: true, message: '请输入设备 UUID。', trigger: 'change' },
    { pattern: /^[\da-fA-F]{32}$/, message: '无效的 JOOX UUID，请输入 32 位十六进制字符。', trigger: 'change' },
  ],
};

async function resetForm() {
  form.jooxUUID = await storage.loadJooxUUID();
  formRef.value?.clearValidate();
}

async function save() {
  await formRef.value?.validate();
  saving.value = true;
  try {
    await storage.saveJooxUUID(form.jooxUUID);
    visible.value = false;
  } finally {
    saving.value = false;
  }
}

watch(
  visible,
  (isVisible) => {
    if (isVisible) void resetForm();
  },
  { immediate: true },
);
</script>

<template>
  <ElDialog v-model="visible" title="解密设定" class="um-config-dialog" align-center>
    <ElForm ref="formRef" :rules="rules" status-icon :model="form" label-width="0">
      <section>
        <label class="config-label">
          <span>
            JOOX Music ·
            <Ruby caption="Unique Device Identifier">设备唯一识别码</Ruby>
          </span>
          <ElFormItem prop="jooxUUID">
            <ElInput v-model="form.jooxUUID" type="text" clearable maxlength="32" show-word-limit />
          </ElFormItem>
        </label>

        <p class="tip">
          下载该加密文件的 JOOX 应用所记录的设备唯一识别码。
          <br />
          JOOX 解密组件是可选依赖；未安装时不影响其他音乐格式。
        </p>
      </section>
    </ElForm>
    <template #footer>
      <ElButton type="primary" :loading="saving" @click="save">确 定</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.config-label {
  display: block;
  line-height: 1.2;
  cursor: pointer;
}

:deep(.el-input__inner) {
  font-family: 'Courier New', Courier, monospace;
}

:deep(.um-config-dialog) {
  width: 40em;
  max-width: 90%;
}
</style>
