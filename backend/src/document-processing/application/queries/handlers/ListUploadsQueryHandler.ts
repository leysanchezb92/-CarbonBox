import { Either } from '../../../../shared/domain/Either';
import { IQueryHandler } from '../../../../shared/application/IQueryHandler';
import { IUploadRepository } from '../../../domain/repositories/IUploadRepository';
import { InvalidPaginationError } from '../../errors/ApplicationErrors';
import { PaginatedUploadsDto, toUploadDto } from '../../dtos/UploadDto';
import { ListUploadsQuery } from '../objects/ListUploadsQuery';

export class ListUploadsQueryHandler
  implements IQueryHandler<ListUploadsQuery, PaginatedUploadsDto>
{
  constructor(private readonly uploadRepository: IUploadRepository) {}

  async execute(query: ListUploadsQuery): Promise<Either<Error, PaginatedUploadsDto>> {
    const { page, limit } = query;

    if (!Number.isInteger(page) || page < 1) {
      return Either.left(new InvalidPaginationError('page debe ser un entero mayor o igual a 1'));
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return Either.left(new InvalidPaginationError('limit debe ser un entero entre 1 y 100'));
    }

    const { items, total } = await this.uploadRepository.list({ page, limit });
    return Either.right({ data: items.map(toUploadDto), total, page, limit });
  }
}
