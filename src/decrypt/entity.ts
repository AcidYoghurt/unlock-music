export interface DecryptResult {
  title: string;
  album?: string;
  artist?: string;

  mime: string;
  ext: string;

  file: string;
  blob: Blob;
  picture?: string;

  message?: string;
  rawExt?: string;
  rawFilename?: string;
}

export interface EditableDecryptResult extends DecryptResult {
  albumartist?: string;
  genre?: string;
}

export interface MusicMetadataEdits {
  picture?: Blob;
  title: string;
  artist: string;
  album: string;
  albumartist: string;
  genre: string;
}

export interface FileInfo {
  status: string;
  name: string;
  size: number;
  percentage: number;
  uid: number;
  raw: File;
}
