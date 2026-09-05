import type { DecryptFunction, DecryptTaskQueue, QueueCallback } from '@/application/ports/DecryptTaskQueue';
import type { DecryptResult, FileInfo } from '@/decrypt/entity';

interface WorkerRequest {
  id: number;
  file: FileInfo;
  config: Record<string, unknown>;
}

interface WorkerResponse {
  id: number;
  result?: DecryptResult;
  error?: string;
}

export class NativeDecryptWorkerPool implements DecryptTaskQueue {
  private readonly workers: Worker[];
  private readonly available: Worker[];
  private readonly pending: QueueCallback[] = [];
  private requestId = 0;

  constructor(size: number) {
    this.workers = Array.from(
      { length: Math.max(1, size) },
      () => new Worker(new URL('../utils/worker.ts', import.meta.url), { type: 'module' }),
    );
    this.available = [...this.workers];
  }

  queue(callback: QueueCallback): void {
    this.pending.push(callback);
    this.consume();
  }

  terminate(): void {
    this.pending.length = 0;
    this.workers.forEach((worker) => worker.terminate());
    this.available.length = 0;
  }

  private consume(): void {
    while (this.available.length > 0 && this.pending.length > 0) {
      const worker = this.available.pop();
      const callback = this.pending.shift();
      if (!worker || !callback) return;

      void callback(this.createDecryptFunction(worker)).finally(() => {
        this.available.push(worker);
        this.consume();
      });
    }
  }

  private createDecryptFunction(worker: Worker): DecryptFunction {
    return (file, config) => {
      const id = ++this.requestId;

      return new Promise<DecryptResult>((resolve, reject) => {
        const cleanup = () => {
          worker.removeEventListener('message', handleMessage);
          worker.removeEventListener('error', handleWorkerError);
        };
        const handleMessage = (event: MessageEvent<WorkerResponse>) => {
          if (event.data.id !== id) return;
          cleanup();
          if (event.data.result) resolve(event.data.result);
          else reject(new Error(event.data.error || '解密 Worker 未返回结果'));
        };
        const handleWorkerError = (event: ErrorEvent) => {
          cleanup();
          reject(event.error || new Error(event.message));
        };

        worker.addEventListener('message', handleMessage);
        worker.addEventListener('error', handleWorkerError);
        worker.postMessage({ id, file, config } satisfies WorkerRequest);
      });
    };
  }
}
