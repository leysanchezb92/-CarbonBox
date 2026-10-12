import { Either } from '../../../../shared/domain/Either';
import { IQueryHandler } from '../../../../shared/application/IQueryHandler';
import { IUploadRepository } from '../../../domain/repositories/IUploadRepository';
import { UploadStatsDto } from '../../dtos/UploadStatsDto';
import { GetUploadStatsQuery } from '../objects/GetUploadStatsQuery';

export class GetUploadStatsQueryHandler
  implements IQueryHandler<GetUploadStatsQuery, UploadStatsDto>
{
  constructor(private readonly uploadRepository: IUploadRepository) {}

  async execute(_query: GetUploadStatsQuery): Promise<Either<Error, UploadStatsDto>> {
    const counts = await this.uploadRepository.countByStatus();

    const completed = counts.COMPLETED;
    const failed = counts.FAILED;
    const inProgress = counts.PENDING + counts.PROCESSING;

    return Either.right({ total: completed + failed + inProgress, completed, inProgress, failed });
  }
}
