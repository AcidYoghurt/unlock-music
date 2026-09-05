declare module '@unlock-music/joox-crypto' {
  interface JooxDecryptor {
    decryptFile(data: Uint8Array): Uint8Array[];
  }

  export default function jooxFactory(data: Uint8Array, uuid: string): JooxDecryptor | undefined;
}
