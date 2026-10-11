import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaUploadRepository } from './document-processing/infrastructure/persistence/repositories/PrismaUploadRepository';
import { CreateUploadCommandHandler } from './document-processing/application/commands/handlers/CreateUploadCommandHandler';
import { CreateUploadCommand } from './document-processing/application/commands/objects/CreateUploadCommand';
import { GetUploadByIdQueryHandler } from './document-processing/application/queries/handlers/GetUploadByIdQueryHandler';
import { GetUploadByIdQuery } from './document-processing/application/queries/objects/GetUploadByIdQuery';
import { ListUploadsQueryHandler } from './document-processing/application/queries/handlers/ListUploadsQueryHandler';
import { ListUploadsQuery } from './document-processing/application/queries/objects/ListUploadsQuery';
import { IFileStorage } from './document-processing/application/ports/IFileStorage';
import {
  FileUploadedMessage,
  IMessagePublisher,
} from './document-processing/application/ports/IMessagePublisher';

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  const repository = new PrismaUploadRepository(prisma);

  const fileStorage: IFileStorage = {
    save: async ({ fileName }) => `fake-storage/${fileName}`,
    read: async () => Buffer.from(''),
  };
  const published: FileUploadedMessage[] = [];
  const messagePublisher: IMessagePublisher = {
    publish: async (message) => {
      published.push(message);
    },
  };

  const createUpload = new CreateUploadCommandHandler(repository, fileStorage, messagePublisher);
  const getUploadById = new GetUploadByIdQueryHandler(repository);
  const listUploads = new ListUploadsQueryHandler(repository);

  const invalid = await createUpload.execute(
    new CreateUploadCommand('datos.txt', Buffer.from('x'), 'user-123'),
  );
  console.log('1)', invalid.isLeft() ? `ERROR: ${invalid.value.message}` : 'OK');

  const created = await createUpload.execute(
    new CreateUploadCommand('sample-data.csv', Buffer.from('category,amount,unit,date\n'), 'user-123'),
  );
  if (created.isLeft()) throw created.value;
  console.log('2)', created.value.status, created.value.fileName);

  const found = await getUploadById.execute(new GetUploadByIdQuery(created.value.id));
  console.log('3)', found.isRight() && found.value.id === created.value.id ? 'OK' : 'ERROR');

  const missing = await getUploadById.execute(new GetUploadByIdQuery('no-existe'));
  console.log('4)', missing.isLeft() ? `ERROR: ${missing.value.message}` : 'OK');

  const page = await listUploads.execute(new ListUploadsQuery(1, 10));
  console.log(
    '5)',
    page.isRight() ? `total=${page.value.total}, en esta página=${page.value.data.length}` : 'ERROR',
  );

  console.log('6) mensajes publicados:', published.length);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
