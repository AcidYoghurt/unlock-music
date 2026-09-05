import { computed, shallowRef, watch } from 'vue';
import { Buffer } from 'buffer';
import { parseBlob as parseMetadata } from 'music-metadata';

import type { MusicUiPort } from '@/application/ports/MusicUiPort';
import type { EditableDecryptResult, MusicMetadataEdits } from '@/decrypt/entity';
import {
  AudioMimeType,
  GetImageFromURL,
  RewriteMetaToFlac,
  RewriteMetaToMp3,
  split_regex,
  ToOwnedArrayBuffer,
} from '@/decrypt/utils';
import type { FileSystemDirectoryHandle } from '@/shims-fs';
import { DirectlyWriteFile, DownloadBlobMusic, FilenamePolicy, RemoveBlobMusic } from '@/utils/utils';

const delay = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export function useMusicLibrary(ui: MusicUiPort) {
  const tracks = shallowRef<EditableDecryptResult[]>([]);
  const playingUrl = shallowRef('');
  const playingAuto = shallowRef(false);
  const filenamePolicy = shallowRef(FilenamePolicy.ArtistAndTitle);
  const instantSave = shallowRef(false);
  const directory = shallowRef<FileSystemDirectoryHandle>();
  const showConfigDialog = shallowRef(false);
  const showEditDialog = shallowRef(false);
  const editingTrack = shallowRef<EditableDecryptResult>();
  const editingIndex = shallowRef(-1);

  const writesDirectly = computed(() => Boolean(directory.value));

  async function saveFile(track: EditableDecryptResult) {
    if (directory.value) {
      await DirectlyWriteFile(track, filenamePolicy.value, directory.value);
      ui.notify({
        type: 'success',
        title: '保存成功',
        message: track.title,
        duration: 3_000,
        position: 'top-left',
      });
      return;
    }

    DownloadBlobMusic(track, filenamePolicy.value);
  }

  async function handleSuccess(result: EditableDecryptResult) {
    if (instantSave.value) {
      await saveFile(result);
      RemoveBlobMusic(result);
    } else {
      tracks.value = [...tracks.value, result];
      ui.notify({
        type: 'success',
        title: '解锁成功',
        message: `成功解锁 ${result.title}`,
        duration: 3_000,
      });
    }

    if (import.meta.env.PROD) {
      const reportData = [result.title, result.artist, result.album];
      window._paq?.push(['trackEvent', 'Unlock', `${result.rawExt},${result.mime}`, JSON.stringify(reportData)]);
    }
  }

  function handleError(error: unknown, filename: string) {
    console.error(error, filename);
    ui.notify({
      type: 'error',
      title: '出现问题',
      message: `${String(error)}，${filename}`,
      duration: 6_000,
    });

    if (import.meta.env.PROD) {
      window._paq?.push(['trackEvent', 'Error', String(error), filename]);
    }
  }

  function play(url: string) {
    playingUrl.value = url;
    playingAuto.value = true;
  }

  function removeTrack(fileUrl: string) {
    const track = tracks.value.find((item) => item.file === fileUrl);
    if (!track) return;

    RemoveBlobMusic(track);
    tracks.value = tracks.value.filter((item) => item.file !== fileUrl);
    if (playingUrl.value === fileUrl) {
      playingUrl.value = '';
      playingAuto.value = false;
    }
  }

  function deleteAll() {
    tracks.value.forEach(RemoveBlobMusic);
    tracks.value = [];
  }

  async function downloadAll() {
    for (const track of tracks.value) {
      await saveFile(track);
      await delay(300);
    }
  }

  async function editTrack(track: EditableDecryptResult) {
    const metadata = await parseMetadata(track.blob);
    editingIndex.value = tracks.value.indexOf(track);
    editingTrack.value = {
      ...track,
      albumartist: metadata.common.albumartist || '',
      genre: metadata.common.genre?.join(', ') || '',
    };
    showEditDialog.value = true;
  }

  async function saveEdits(edits: MusicMetadataEdits) {
    const index = editingIndex.value;
    const current = tracks.value[index];
    if (!current) return;

    let nextBlob = current.blob;
    let nextPicture = current.picture;
    let outcome: 'success' | 'error' | 'warning' = 'success';
    let message = `成功修改 ${edits.title}`;

    try {
      const originalMetadata = await parseMetadata(current.blob);
      const picture = edits.picture
        ? await edits.picture.arrayBuffer()
        : current.picture
          ? (await GetImageFromURL(current.picture))?.buffer
          : undefined;
      const newMetadata = {
        picture,
        title: edits.title,
        artists: edits.artist.split(split_regex).filter(Boolean),
        album: edits.album,
        albumartist: edits.albumartist,
        genre: edits.genre.split(split_regex).filter(Boolean),
      };
      const audioBuffer = Buffer.from(await current.blob.arrayBuffer());
      const mime = AudioMimeType[current.ext] || AudioMimeType.mp3;

      if (current.ext === 'mp3') {
        nextBlob = new Blob([ToOwnedArrayBuffer(RewriteMetaToMp3(audioBuffer, newMetadata, originalMetadata))], {
          type: mime,
        });
      } else if (current.ext === 'flac') {
        nextBlob = new Blob([ToOwnedArrayBuffer(RewriteMetaToFlac(audioBuffer, newMetadata, originalMetadata))], {
          type: mime,
        });
      } else {
        outcome = 'warning';
        message = `${current.ext} 类型文件暂时不支持修改音乐标签`;
      }

      if (edits.picture) {
        if (current.picture?.startsWith('blob:')) URL.revokeObjectURL(current.picture);
        nextPicture = URL.createObjectURL(edits.picture);
      }
    } catch (error) {
      outcome = 'error';
      message = `修改 ${edits.title} 未能完成：${String(error)}`;
    }

    URL.revokeObjectURL(current.file);
    const updated: EditableDecryptResult = {
      ...current,
      ...edits,
      picture: nextPicture,
      blob: nextBlob,
      file: URL.createObjectURL(nextBlob),
    };
    tracks.value = tracks.value.map((track, trackIndex) => (trackIndex === index ? updated : track));
    editingTrack.value = undefined;
    editingIndex.value = -1;

    ui.notify({
      type: outcome,
      title: outcome === 'success' ? '修改成功' : outcome === 'error' ? '修改失败' : '修改取消',
      message,
      duration: 3_000,
    });
  }

  async function offerDirectSave() {
    if (!window.showDirectoryPicker) return;
    const accepted = await ui.confirm('您的浏览器支持文件直接保存到磁盘，是否使用？', '新特性提示');
    if (!accepted) return;

    try {
      const selectedDirectory = await window.showDirectoryPicker();
      const testFilename = '__unlock_music_write_test.txt';
      await selectedDirectory.getFileHandle(testFilename, { create: true });
      await selectedDirectory.removeEntry(testFilename);
      directory.value = selectedDirectory;
    } catch (error) {
      console.error(error);
    }
  }

  watch(instantSave, (enabled) => {
    if (enabled) void offerDirectSave();
  });

  return {
    directory,
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
  };
}
