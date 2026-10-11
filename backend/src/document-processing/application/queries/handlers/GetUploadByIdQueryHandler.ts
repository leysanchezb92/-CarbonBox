import { Either } from '../../../../shared/domain/Either';
import { IQueryHandler } from '../../../../shared/application/IQueryHandler';
import { IUploadRepository } from '../../../domain/repositories/IUploadRepository';
import { UploadNotFoundError } from '../../errors/ApplicationErrors';
import { toUploadDto, UploadDto } from '../../dtos/UploadDto';
import { GetUploadByIdQuery } from '../objects/GetUploadByIdQuery';

export class GetUploadByIdQueryHandler
  implements IQueryHandler<GetUploadByIdQuery, UploadDto>
{
  constructor(private readonly uploadRepository: IUploadRepository) {}

  async execute(query: GetUploadByIdQuery): Promise<Either<Error, UploadDto>> {
    const upload = await this.uploadRepository.findById(query.id);
    if (upload === null) {
      return Either.left(new UploadNotFoundError(`No existe el upload con id "${query.id}"`));
    }
    return Either.right(toUploadDto(upload));
  }
}
