import { FastifyReply, FastifyRequest } from 'fastify';
import { GetUploadStatsQuery } from '../../application/queries/objects/GetUploadStatsQuery';
import { GetUploadStatsQueryHandler } from '../../application/queries/handlers/GetUploadStatsQueryHandler';

export class GetUploadStatsController {
  constructor(private readonly getUploadStatsHandler: GetUploadStatsQueryHandler) {}

  async handle(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await this.getUploadStatsHandler.execute(new GetUploadStatsQuery());
    if (result.isLeft()) {
      throw result.value;
    }
    reply.send(result.value);
  }
}
