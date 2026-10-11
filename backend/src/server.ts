import { PrismaClient } from '../generated/prisma/client';
import { buildApp } from './app';
import { config } from './config';
import { DocumentProcessingModule } from './document-processing/infrastructure/dependency-injection/DocumentProcessingModule';
import { PrismaUploadRepository } from './document-processing/infrastructure/persistence/repositories/PrismaUploadRepository';

async function main(): Promise<void> {
  const prisma = new PrismaClient();

  const documentProcessing = new DocumentProcessingModule({
    uploadRepository: new PrismaUploadRepository(prisma),
    storageDir: config.storageDir,
    defaultUserId: config.defaultUserId,
  });

  const app = await buildApp({ documentProcessing, config });
  await app.listen({ port: config.port, host: '0.0.0.0' });

  const shutdown = async (): Promise<void> => {
    await app.close();
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
