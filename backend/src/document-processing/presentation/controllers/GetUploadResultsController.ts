import { FastifyReply, FastifyRequest } from 'fastify';
import { GetUploadResultsQuery } from '../../application/queries/objects/GetUploadResultsQuery';
import { GetUploadResultsQueryHandler } from '../../application/queries/handlers/GetUploadResultsQueryHandler';

export class GetUploadResultsController {
  constructor(private readonly getUploadResultsHandler: GetUploadResultsQueryHandler) {}

  async handle(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.getUploadResultsHandler.execute(new GetUploadResultsQuery(request.params.id));
    if (result.isLeft()) {
      throw result.value;
    }
    reply.send(result.value);
  }
}
