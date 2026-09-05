import { KgmHeaderSize, SniffKgmEncryptedExt } from '../kgm_format';
import { Decrypt } from '../index';

const { decryptKgm } = vi.hoisted(() => ({ decryptKgm: vi.fn() }));

vi.mock('@/decrypt/kgm', () => ({ Decrypt: decryptKgm }));

const kgmHeader = new Uint8Array([
  0x7c, 0xd5, 0x32, 0xeb, 0x86, 0x02, 0x7f, 0x4b, 0xa8, 0xaf, 0xa6, 0x8e, 0x0f, 0xff, 0x99, 0x14,
]);

describe('decrypt/kgm format detection', () => {
  it('detects KGM data even when the filename uses another extension', () => {
    expect(KgmHeaderSize).toBe(16);
    expect(SniffKgmEncryptedExt(kgmHeader)).toBe('kgm');
  });

  it('does not identify regular FLAC data as KGM', () => {
    expect(SniffKgmEncryptedExt(new Uint8Array([0x66, 0x4c, 0x61, 0x43]))).toBeUndefined();
  });

  it('keeps VPR header detection distinct from KGM', () => {
    const header = new Uint8Array([
      0x05, 0x28, 0xbc, 0x96, 0xe9, 0xe4, 0x5a, 0x43, 0x91, 0xaa, 0xbd, 0xd0, 0x7a, 0xf5, 0x36, 0x31,
    ]);

    expect(SniffKgmEncryptedExt(header)).toBe('vpr');
  });

  it('routes a .kgm.flac file to the KGM decryptor and strips the embedded extension', async () => {
    const decryptedBlob = new Blob(['decoded'], { type: 'audio/mpeg' });
    decryptKgm.mockResolvedValueOnce({
      title: 'Honest',
      artist: 'rei brown',
      ext: 'mp3',
      mime: 'audio/mpeg',
      file: 'blob:decoded',
      blob: decryptedBlob,
    });

    const raw = new File([kgmHeader, new Uint8Array([1, 2, 3])], 'rei brown - Honest.kgm.flac');
    const result = await Decrypt(
      {
        status: 'ready',
        name: raw.name,
        size: raw.size,
        percentage: 0,
        uid: 1,
        raw,
      },
      {},
    );

    expect(decryptKgm).toHaveBeenCalledWith(raw, 'rei brown - Honest', 'kgm');
    expect(result.rawFilename).toBe('rei brown - Honest');
    expect(result.rawExt).toBe('kgm');
  });
});
