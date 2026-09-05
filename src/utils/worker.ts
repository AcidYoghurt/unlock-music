import { Decrypt } from '@/decrypt';
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

self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const { id, file, config } = event.data;

  void Decrypt(file, config)
    .then((result) => self.postMessage({ id, result } satisfies WorkerResponse))
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      self.postMessage({ id, error: message } satisfies WorkerResponse);
    });
});
