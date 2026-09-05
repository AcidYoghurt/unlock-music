import { Blob } from 'node:buffer';

globalThis.Blob ??= Blob as unknown as typeof globalThis.Blob;
