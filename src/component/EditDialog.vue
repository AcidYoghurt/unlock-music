<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, shallowRef, watch } from 'vue';
import { Check, Edit, UploadFilled } from '@element-plus/icons-vue';
import type { UploadFile } from 'element-plus';

import type { EditableDecryptResult, MusicMetadataEdits } from '@/decrypt/entity';

type TextFieldKey = 'title' | 'artist' | 'album' | 'albumartist' | 'genre';

const textFields: ReadonlyArray<{ key: TextFieldKey; label: string }> = [
  { key: 'title', label: '标题' },
  { key: 'artist', label: '艺术家' },
  { key: 'album', label: '专辑' },
  { key: 'albumartist', label: '专辑艺术家' },
  { key: 'genre', label: '风格' },
];

const props = defineProps<{
  track: EditableDecryptResult;
}>();

const visible = defineModel<boolean>({ required: true });
const emit = defineEmits<{
  save: [edits: MusicMetadataEdits];
}>();

const draft = reactive({
  title: '',
  artist: '',
  album: '',
  albumartist: '',
  genre: '',
});
const editing = reactive({
  picture: false,
  title: false,
  artist: false,
  album: false,
  albumartist: false,
  genre: false,
});
const pendingPicture = shallowRef<Blob>();
const selectedPicture = shallowRef<Blob>();
const previewUrl = shallowRef('');
const previewSource = computed(() => previewUrl.value || props.track.picture || '');

function revokePreview() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = '';
}

function resetDraft() {
  revokePreview();
  draft.title = props.track.title || '';
  draft.artist = props.track.artist || '';
  draft.album = props.track.album || '';
  draft.albumartist = props.track.albumartist || '';
  draft.genre = props.track.genre || '';
  pendingPicture.value = undefined;
  selectedPicture.value = undefined;
  Object.keys(editing).forEach((key) => {
    editing[key as keyof typeof editing] = false;
  });
}

function addPicture(file: UploadFile) {
  pendingPicture.value = file.raw;
}

function removePicture() {
  pendingPicture.value = undefined;
}

function toggleCoverEditor() {
  editing.picture = !editing.picture;
  if (!editing.picture && pendingPicture.value) {
    selectedPicture.value = pendingPicture.value;
    revokePreview();
    previewUrl.value = URL.createObjectURL(pendingPicture.value);
  }
}

function save() {
  if (editing.picture) toggleCoverEditor();
  emit('save', {
    picture: selectedPicture.value,
    title: draft.title,
    artist: draft.artist,
    album: draft.album,
    albumartist: draft.albumartist,
    genre: draft.genre,
  });
  visible.value = false;
}

watch(
  [visible, () => props.track],
  ([isVisible]) => {
    if (isVisible) resetDraft();
  },
  { immediate: true },
);

onBeforeUnmount(revokePreview);
</script>

<template>
  <ElDialog v-model="visible" title="音乐标签编辑" class="um-edit-dialog" align-center>
    <section>
      <div class="music-cover">
        <ElImage v-show="!editing.picture" :src="previewSource">
          <template #error>
            <div class="image-slot el-image__error">暂无封面</div>
          </template>
        </ElImage>
        <ElUpload
          v-show="editing.picture"
          :auto-upload="false"
          :on-change="addPicture"
          :on-remove="removePicture"
          :show-file-list="true"
          :limit="1"
          list-type="picture"
          action="#"
          drag
        >
          <ElIcon class="upload-icon"><UploadFilled /></ElIcon>
          <div class="el-upload__text">将新图片拖到此处，或<em>点击选择</em><br />以替换自动匹配的图片</div>
          <template #tip>
            <div class="el-upload__tip">新拖到此处的图片将覆盖原始图片</div>
          </template>
        </ElUpload>
        <ElIcon class="edit-toggle" @click="toggleCoverEditor">
          <component :is="editing.picture ? Check : Edit" />
        </ElIcon>
      </div>

      <div v-for="field in textFields" :key="field.key" class="edit-item">
        <div class="label">{{ field.label }}</div>
        <div v-show="!editing[field.key]" class="value">{{ draft[field.key] }}</div>
        <ElInput v-show="editing[field.key]" v-model="draft[field.key]" class="input" size="small" />
        <ElIcon class="edit-toggle" @click="editing[field.key] = !editing[field.key]">
          <component :is="editing[field.key] ? Check : Edit" />
        </ElIcon>
      </div>

      <p class="tip">
        为了节省您设备的资源，请在确定前充分检查，避免反复修改。<br />
        直接关闭此对话框不会保留所作的更改。
      </p>
    </section>
    <template #footer>
      <ElButton type="primary" @click="save">确 定</ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
:deep(.um-edit-dialog) {
  width: 30em;
  max-width: 90%;
}

.upload-icon {
  font-size: 40px;
  color: var(--el-text-color-placeholder);
}

.edit-toggle {
  flex-shrink: 0;
  cursor: pointer;
}
</style>
