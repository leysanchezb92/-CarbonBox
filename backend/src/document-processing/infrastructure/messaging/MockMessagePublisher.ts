import { mkdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  FileUploadedMessage,
  IMessagePublisher,
} from '../../application/ports/IMessagePublisher';

/**
 * Cola simulada ("buzón"): cada mensaje es un archivo .json dentro de <storageDir>/queue.
 * Se usa una carpeta, y no la memoria, para que el worker (otro proceso) pueda leerla.
 */
export class MockMessagePublisher implements IMessagePublisher {
  private readonly queueDir: string;

  constructor(storageDir: string) {
    this.queueDir = path.resolve(storageDir, 'queue');
  }

  async publish(message: FileUploadedMessage): Promise<void> {
    await mkdir(this.queueDir, { recursive: true });
    const baseName = `${Date.now()}-${message.uploadId}`;
    const tempPath = path.join(this.queueDir, `${baseName}.tmp`);
    const finalPath = path.join(this.queueDir, `${baseName}.json`);

    // Se escribe como .tmp y luego se renombra: el worker nunca ve un mensaje a medio escribir.
    await writeFile(tempPath, JSON.stringify(message));
    await rename(tempPath, finalPath);
  }
}
