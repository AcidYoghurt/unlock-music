import fs from 'fs';
import { fileURLToPath } from 'node:url';
import { vi, type MockedFunction } from 'vitest';

import { storage } from '@/utils/storage';

import { Decrypt as decryptJoox } from '../joox';
import { extractQQMusicMeta as extractQQMusicMetaOrig } from '@/utils/qm_meta';

vi.mock('@/utils/storage');
vi.mock('@/utils/qm_meta');

const loadJooxUUID = storage.loadJooxUUID as MockedFunction<typeof storage.loadJooxUUID>;
const extractQQMusicMeta = extractQQMusicMetaOrig as MockedFunction<typeof extractQQMusicMetaOrig>;

const TEST_UUID_ZEROS = ''.padStart(32, '0');
const encryptedFile1 = fs.readFileSync(fileURLToPath(new URL('./fixture/joox_1.bin', import.meta.url)));
const hasJooxCrypto = process.env.JOOX_CRYPTO_AVAILABLE === 'true';

describe('decrypt/joox', () => {
  (hasJooxCrypto ? it : it.skip)('should be able to decrypt sample file (v4)', async () => {
    loadJooxUUID.mockResolvedValue(TEST_UUID_ZEROS);
    extractQQMusicMeta.mockImplementationOnce(async (blob: Blob) => {
      return {
        title: 'unused',
        album: 'unused',
        blob: blob,
        artist: 'unused',
        imgUrl: 'https://example.unlock-music.dev/',
      };
    });

    const result = await decryptJoox(new Blob([encryptedFile1]), 'test.bin', 'bin');
    const resultBuf = await result.blob.arrayBuffer();
    expect(resultBuf).toEqual(Buffer.from('Hello World', 'utf-8').buffer);
  });

  if (!hasJooxCrypto) {
    it('should report that the optional decoder is unavailable', async () => {
      loadJooxUUID.mockResolvedValue(TEST_UUID_ZEROS);
      await expect(decryptJoox(new Blob([encryptedFile1]), 'test.bin', 'bin')).rejects.toThrow(
        '当前构建未包含 JOOX 解密组件',
      );
    });
  }

  (hasJooxCrypto ? it : it.skip)('should reject E!99 files', async () => {
    loadJooxUUID.mockResolvedValue(TEST_UUID_ZEROS);

    const input = new Blob([Buffer.from('E!99....')]);
    await expect(decryptJoox(input, 'test.bin', 'bin')).rejects.toThrow('不支持的 joox 加密格式');
  });

  it('should reject empty uuid', async () => {
    loadJooxUUID.mockResolvedValue('');
    const input = new Blob([encryptedFile1]);
    await expect(decryptJoox(input, 'test.bin', 'bin')).rejects.toThrow('UUID');
  });

  it('should reject invalid uuid', async () => {
    loadJooxUUID.mockResolvedValue('hello!');
    const input = new Blob([encryptedFile1]);
    await expect(decryptJoox(input, 'test.bin', 'bin')).rejects.toThrow('UUID');
  });
});
