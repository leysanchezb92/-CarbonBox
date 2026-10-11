import { Either } from '../../../../shared/domain/Either';
import { ICommandHandler } from '../../../../shared/application/ICommandHandler';
import { Upload } from '../../../domain/entities/Upload';
import { FileName } from '../../../domain/value-objects/FileName';
import { IUploadRepository } from '../../../domain/repositories/IUploadRepository';
import { EmptyFileError } from '../../errors/ApplicationErrors';
import { IFileStorage } from '../../ports/IFileStorage';
import { IMessagePublisher } from '../../ports/IMessagePublisher';
import { toUploadDto, UploadDto } from '../../dtos/UploadDto';
import { CreateUploadCommand } from '../objects/CreateUploadCommand';

export class CreateUploadCommandHandler
  implements ICommandHandler<CreateUploadCommand, UploadDto>
{
  constructor(
    private readonly uploadRepository: IUploadRepository,
    private readonly fileStorage: IFileStorage,
    private readonly messagePublisher: IMessagePublisher,
  ) {}

  async execute(command: CreateUploadCommand): Promise<Either<Error, UploadDto>> {
    const fileNameOrError = FileName.create(command.fileName);
    if (fileNameOrError.isLeft()) {
      return Either.left(fileNameOrError.value);
    }
    if (command.content.length === 0) {
      return Either.left(new EmptyFileError('El archivo está vacío'));
    }
  
    const fileUrl = await this.fileStorage.save({
      fileName: fileNameOrError.value.value,
      content: command.content,
    });
    const upload = Upload.create({
      fileName: fileNameOrError.value,
      fileUrl,
      userId: command.userId,
    });

    await this.uploadRepository.save(upload);
    await this.messagePublisher.publish({ uploadId: upload.id, fileUrl });

    return Either.right(toUploadDto(upload));
  }
}
