import type { DecryptResult, FileInfo } from '@/decrypt/entity';

export type DecryptFunction = (file: FileInfo, config: Record<string, unknown>) => Promise<DecryptResult>;
export type QueueCallback = (decrypt?: DecryptFunction) => Promise<void>;

export interface DecryptTaskQueue {
  queue(callback: QueueCallback): unknown;
  terminate?(force?: boolean): void | Promise<void>;
}
