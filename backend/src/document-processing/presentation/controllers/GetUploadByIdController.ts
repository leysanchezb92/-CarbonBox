import { FastifyReply, FastifyRequest } from 'fastify';
import { GetUploadByIdQuery } from '../../application/queries/objects/GetUploadByIdQuery';
import { GetUploadByIdQueryHandler } from '../../application/queries/handlers/GetUploadByIdQueryHandler';

export class GetUploadByIdController {
  constructor(private readonly getUploadByIdHandler: GetUploadByIdQueryHandler) {}

  async handle(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.getUploadByIdHandler.execute(new GetUploadByIdQuery(request.params.id));
    if (result.isLeft()) {
      throw result.value;
    }
    reply.send(result.value);
  }
}
