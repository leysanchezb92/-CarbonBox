import { Either } from '../../../../shared/domain/Either';
import { IQueryHandler } from '../../../../shared/application/IQueryHandler';
import { IActivityDataRepository } from '../../../domain/repositories/IActivityDataRepository';
import { IUploadRepository } from '../../../domain/repositories/IUploadRepository';
import { toActivityDataDto, UploadResultsDto } from '../../dtos/ActivityDataDto';
import { UploadNotFoundError } from '../../errors/ApplicationErrors';
import { GetUploadResultsQuery } from '../objects/GetUploadResultsQuery';

export class GetUploadResultsQueryHandler
  implements IQueryHandler<GetUploadResultsQuery, UploadResultsDto>
{
  constructor(
    private readonly uploadRepository: IUploadRepository,
    private readonly activityDataRepository: IActivityDataRepository,
  ) {}

  async execute(query: GetUploadResultsQuery): Promise<Either<Error, UploadResultsDto>> {
    const upload = await this.uploadRepository.findById(query.uploadId);
    if (upload === null) {
      return Either.left(new UploadNotFoundError(`No existe el upload con id "${query.uploadId}"`));
    }

    const items = await this.activityDataRepository.findByUploadId(upload.id);
    return Either.right({ data: items.map(toActivityDataDto) });
  }
}
