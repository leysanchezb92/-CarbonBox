import 'dotenv/config';
import path from 'node:path';

export const config = {
  port: Number(process.env.PORT ?? 3001),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
  storageDir: path.resolve(process.env.STORAGE_DIR ?? 'storage'),
  maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_MB ?? 10) * 1024 * 1024,
  // Sin login en esta prueba: todos los uploads pertenecen a un usuario fijo.
  defaultUserId: 'user-123',
};

export type AppConfig = typeof config;
