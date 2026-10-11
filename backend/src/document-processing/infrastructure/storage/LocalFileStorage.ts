import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { IFileStorage, SaveFileInput } from '../../application/ports/IFileStorage';

/** Guarda los archivos en una carpeta del disco: <storageDir>/uploads */
export class LocalFileStorage implements IFileStorage {
  private readonly uploadsDir: string;

  constructor(storageDir: string) {
    this.uploadsDir = path.resolve(storageDir, 'uploads');
  }

  async save(input: SaveFileInput): Promise<string> {
    await mkdir(this.uploadsDir, { recursive: true });
    // El prefijo aleatorio evita que dos archivos con el mismo nombre se pisen.
    const storedName = `${randomUUID()}-${input.fileName}`;
    await writeFile(path.join(this.uploadsDir, storedName), input.content);
    return storedName;
  }

  async read(fileUrl: string): Promise<Buffer> {
    const fullPath = path.resolve(this.uploadsDir, fileUrl);
    // Seguridad: nunca leer fuera de la carpeta de uploads (ej. "../.env").
    if (!fullPath.startsWith(this.uploadsDir + path.sep)) {
      throw new Error('Ruta de archivo inválida');
    }
    return readFile(fullPath);
  }
}
