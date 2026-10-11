import { FastifyReply, FastifyRequest } from 'fastify';
import { ListUploadsQuery } from '../../application/queries/objects/ListUploadsQuery';
import { ListUploadsQueryHandler } from '../../application/queries/handlers/ListUploadsQueryHandler';

export class ListUploadsController {
  constructor(private readonly listUploadsHandler: ListUploadsQueryHandler) {}

  async handle(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    // Los parámetros de la URL llegan como texto; si faltan se usan 1 y 10.
    const page = request.query.page === undefined ? 1 : Number(request.query.page);
    const limit = request.query.limit === undefined ? 10 : Number(request.query.limit);

    const result = await this.listUploadsHandler.execute(new ListUploadsQuery(page, limit));
    if (result.isLeft()) {
      throw result.value;
    }
    reply.send(result.value);
  }
}
