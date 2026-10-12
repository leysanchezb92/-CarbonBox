import { PrismaClient } from '../generated/prisma/client';
import { config } from './config';
import { ProcessFileCommandHandler } from './document-processing/application/commands/handlers/ProcessFileCommandHandler';
import { CsvParserService } from './document-processing/application/services/CsvParserService';
import { FileProcessingService } from './document-processing/application/services/FileProcessingService';
import { MockMessageConsumer } from './document-processing/infrastructure/messaging/MockMessageConsumer';
import { PrismaActivityDataRepository } from './document-processing/infrastructure/persistence/repositories/PrismaActivityDataRepository';
import { PrismaUploadRepository } from './document-processing/infrastructure/persistence/repositories/PrismaUploadRepository';
import { LocalFileStorage } from './document-processing/infrastructure/storage/LocalFileStorage';
import { FileProcessingWorker } from './workers/FileProcessingWorker';

const POLL_INTERVAL_MS = 3000;

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  const processFileHandler = new ProcessFileCommandHandler(
    new PrismaUploadRepository(prisma),
    new PrismaActivityDataRepository(prisma),
    new LocalFileStorage(config.storageDir),
    new FileProcessingService(new CsvParserService()),
  );

  const worker = new FileProcessingWorker(
    new MockMessageConsumer(config.storageDir),
    processFileHandler,
    POLL_INTERVAL_MS,
    console,
  );

  worker.start();
  console.log(`[worker] Esperando mensajes (revisa el buzón cada ${POLL_INTERVAL_MS / 1000} s). Ctrl + C para apagar.`);

  const shutdown = async (): Promise<void> => {
    console.log('[worker] Apagando...');
    await worker.stop();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
