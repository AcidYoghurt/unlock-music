import {
  AudioMimeType,
  BytesHasPrefix,
  GetArrayBuffer,
  GetCoverFromFile,
  GetMetaFromFile,
  SniffAudioExt,
  ToOwnedArrayBuffer,
} from '@/decrypt/utils';
import { parseBlob as metaParseBlob } from 'music-metadata';
import { DecryptResult } from '@/decrypt/entity';
import { DecryptKgmWasm } from '@/decrypt/kgm_wasm';
import { KgmHeader, VprHeader } from '@/decrypt/kgm_format';

export { KgmHeaderSize, SniffKgmEncryptedExt } from '@/decrypt/kgm_format';
export type { KgmEncryptedExt } from '@/decrypt/kgm_format';

export async function Decrypt(file: File, raw_filename: string, raw_ext: string): Promise<DecryptResult> {
  const oriData = await GetArrayBuffer(file);
  if (raw_ext === 'vpr') {
    if (!BytesHasPrefix(new Uint8Array(oriData), VprHeader)) throw Error('Not a valid vpr file!');
  } else {
    if (!BytesHasPrefix(new Uint8Array(oriData), KgmHeader)) throw Error('Not a valid kgm(a) file!');
  }
  let musicDecoded: Uint8Array<ArrayBufferLike> = new Uint8Array();
  if (globalThis.WebAssembly) {
    const kgmDecrypted = await DecryptKgmWasm(oriData, raw_ext);
    if (kgmDecrypted.success) {
      musicDecoded = kgmDecrypted.data;
      console.log('kgm wasm decoder suceeded');
    } else {
      throw new Error(kgmDecrypted.error || '(unknown error)');
    }
  }

  const ext = SniffAudioExt(musicDecoded);
  const mime = AudioMimeType[ext];
  const musicBlob = new Blob([ToOwnedArrayBuffer(musicDecoded)], { type: mime });
  const musicMeta = await metaParseBlob(musicBlob);
  const { title, artist } = GetMetaFromFile(
    raw_filename,
    musicMeta.common.title,
    String(musicMeta.common.artists || musicMeta.common.artist || ''),
  );
  return {
    album: musicMeta.common.album,
    picture: GetCoverFromFile(musicMeta),
    file: URL.createObjectURL(musicBlob),
    blob: musicBlob,
    ext,
    mime,
    title,
    artist,
  };
}
