import { mkdir, readdir, readFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { FileUploadedMessage } from '../../application/ports/IMessagePublisher';
import { IMessageConsumer, QueueMessage } from '../../application/ports/IMessageConsumer';

function isNotFound(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT';
}

/**
 * Lee el "buzón": las notas .json que deja MockMessagePublisher en <storageDir>/queue.
 * Los mensajes que no se pueden atender se apartan en <storageDir>/queue-dead-letter.
 * Está pensado para UN solo worker.
 */
export class MockMessageConsumer implements IMessageConsumer {
  private readonly queueDir: string;
  private readonly deadLetterDir: string;

  constructor(storageDir: string) {
    this.queueDir = path.resolve(storageDir, 'queue');
    this.deadLetterDir = path.resolve(storageDir, 'queue-dead-letter');
  }

  async poll(): Promise<QueueMessage | null> {
    let fileNames: string[];
    try {
      fileNames = await readdir(this.queueDir);
    } catch (error) {
      if (isNotFound(error)) return null; // todavía no existe el buzón: nada que leer
      throw error;
    }

    // El nombre empieza con la hora de publicación: ordenar el texto = ordenar por antigüedad.
    const pending = fileNames.filter((name) => name.endsWith('.json')).sort();

    for (const fileName of pending) {
      const body = await this.readBody(fileName);
      if (body === null) {
        await this.reject(fileName); // nota ilegible o incompleta
        continue;
      }
      return { id: fileName, body };
    }
    return null;
  }

  async acknowledge(messageId: string): Promise<void> {
    try {
      await unlink(path.join(this.queueDir, path.basename(messageId)));
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }
  }

  async reject(messageId: string): Promise<void> {
    const name = path.basename(messageId);
    await mkdir(this.deadLetterDir, { recursive: true });
    try {
      await rename(path.join(this.queueDir, name), path.join(this.deadLetterDir, name));
    } catch (error) {
      if (!isNotFound(error)) throw error;
    }
  }

  private async readBody(fileName: string): Promise<FileUploadedMessage | null> {
    try {
      const raw = await readFile(path.join(this.queueDir, fileName), 'utf-8');
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return null;

      const candidate = parsed as Partial<FileUploadedMessage>;
      if (typeof candidate.uploadId !== 'string' || typeof candidate.fileUrl !== 'string') return null;
      return { uploadId: candidate.uploadId, fileUrl: candidate.fileUrl };
    } catch {
      return null;
    }
  }
}
