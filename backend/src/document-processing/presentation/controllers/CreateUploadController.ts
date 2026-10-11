import { FastifyReply, FastifyRequest } from 'fastify';
import { EmptyFileError } from '../../application/errors/ApplicationErrors';
import { CreateUploadCommand } from '../../application/commands/objects/CreateUploadCommand';
import { CreateUploadCommandHandler } from '../../application/commands/handlers/CreateUploadCommandHandler';

export class CreateUploadController {
  constructor(
    private readonly createUploadHandler: CreateUploadCommandHandler,
    private readonly userId: string,
  ) {}

  async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const file = await request.file();
    if (!file) {
      throw new EmptyFileError('No se envió ningún archivo');
    }
    const content = await file.toBuffer();

    const result = await this.createUploadHandler.execute(
      new CreateUploadCommand(file.filename, content, this.userId),
    );
    if (result.isLeft()) {
      throw result.value; // el errorHandler central decide el código HTTP
    }
    reply.status(201).send(result.value);
  }
}
