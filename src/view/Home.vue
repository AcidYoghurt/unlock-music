<script setup lang="ts">
import { elementPlusMusicUi } from '@/adapters/elementPlusMusicUi';
import ConfigDialog from '@/component/ConfigDialog.vue';
import EditDialog from '@/component/EditDialog.vue';
import FileSelector from '@/component/FileSelector.vue';
import MusicControls from '@/component/MusicControls.vue';
import PreviewTable from '@/component/PreviewTable.vue';
import { useMusicLibrary } from '@/composables/useMusicLibrary';

const {
  editingTrack,
  filenamePolicy,
  instantSave,
  playingAuto,
  playingUrl,
  showConfigDialog,
  showEditDialog,
  tracks,
  writesDirectly,
  deleteAll,
  downloadAll,
  editTrack,
  handleError,
  handleSuccess,
  play,
  removeTrack,
  saveEdits,
  saveFile,
} = useMusicLibrary(elementPlusMusicUi);
</script>

<template>
  <div>
    <FileSelector @error="handleError" @success="handleSuccess" />

    <MusicControls
      v-model:filename-policy="filenamePolicy"
      v-model:instant-save="instantSave"
      :writes-directly="writesDirectly"
      @delete-all="deleteAll"
      @download-all="downloadAll"
      @open-config="showConfigDialog = true"
    />

    <ConfigDialog v-model="showConfigDialog" />
    <EditDialog v-if="editingTrack" v-model="showEditDialog" :track="editingTrack" @save="saveEdits" />

    <audio :autoplay="playingAuto" :src="playingUrl" controls />

    <PreviewTable
      class="table-content"
      :table-data="tracks"
      @download="saveFile"
      @edit="editTrack"
      @play="play"
      @remove="removeTrack"
    />
  </div>
</template>
