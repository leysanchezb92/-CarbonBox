import { Either } from '../../../../shared/domain/Either';
import { ICommandHandler } from '../../../../shared/application/ICommandHandler';
import { Upload } from '../../../domain/entities/Upload';
import { IActivityDataRepository } from '../../../domain/repositories/IActivityDataRepository';
import { IUploadRepository } from '../../../domain/repositories/IUploadRepository';
import { UploadNotFoundError } from '../../errors/ApplicationErrors';
import { IFileStorage } from '../../ports/IFileStorage';
import { FileProcessingService, RowError } from '../../services/FileProcessingService';
import { ProcessFileCommand } from '../objects/ProcessFileCommand';

export interface ProcessUploadResult {
  uploadId: string;
  status: 'COMPLETED' | 'FAILED';
  totalRows: number;
  processedRows: number;
  failedRows: number;
  message: string | null;
  rowErrors: RowError[];
}

export class ProcessFileCommandHandler
  implements ICommandHandler<ProcessFileCommand, ProcessUploadResult>
{
  constructor(
    private readonly uploadRepository: IUploadRepository,
    private readonly activityDataRepository: IActivityDataRepository,
    private readonly fileStorage: IFileStorage,
    private readonly fileProcessingService: FileProcessingService,
  ) {}

  async execute(command: ProcessFileCommand): Promise<Either<Error, ProcessUploadResult>> {
    const upload = await this.uploadRepository.findById(command.uploadId);
    if (upload === null) {
      return Either.left(new UploadNotFoundError(`No existe el upload "${command.uploadId}"`));
    }

    const started = upload.startProcessing();
    if (started.isLeft()) {
      return Either.left(started.value);
    }
    await this.uploadRepository.save(upload);

    try {
      const buffer = await this.fileStorage.read(upload.fileUrl);
      const result = this.fileProcessingService.process(upload.id, buffer.toString('utf-8'));

      if (result.kind === 'invalid_file') {
        return await this.failUpload(upload, result.message, 0, []);
      }

      const { totalRows, validRows, rowErrors } = result;
      if (validRows.length === 0) {
        const firstError = rowErrors[0];
        const detail = firstError ? ` Primer error: línea ${firstError.line}: ${firstError.message}` : '';
        return await this.failUpload(upload, `Ninguna fila válida.${detail}`, totalRows, rowErrors);
      }

      await this.activityDataRepository.saveMany(validRows);

      const completed = upload.complete({
        totalRows,
        processedRows: validRows.length,
        failedRows: rowErrors.length,
      });
      if (completed.isLeft()) {
        return Either.left(completed.value);
      }
      await this.uploadRepository.save(upload);

      return Either.right({
        uploadId: upload.id,
        status: 'COMPLETED',
        totalRows,
        processedRows: validRows.length,
        failedRows: rowErrors.length,
        message: null,
        rowErrors,
      });
    } catch (error) {
      await this.markAsUnexpectedFailure(upload);
      return Either.left(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async failUpload(
    upload: Upload,
    message: string,
    totalRows: number,
    rowErrors: RowError[],
  ): Promise<Either<Error, ProcessUploadResult>> {
    const failed = upload.fail(message);
    if (failed.isLeft()) {
      return Either.left(failed.value);
    }
    await this.uploadRepository.save(upload);

    return Either.right({
      uploadId: upload.id,
      status: 'FAILED',
      totalRows,
      processedRows: 0,
      failedRows: rowErrors.length,
      message,
      rowErrors,
    });
  }

  private async markAsUnexpectedFailure(upload: Upload): Promise<void> {
    try {
      await this.activityDataRepository.deleteByUploadId(upload.id);
      const failed = upload.fail('Error inesperado al procesar el archivo');
      if (failed.isRight()) {
        await this.uploadRepository.save(upload);
      }
    } catch {
    }
  }
}
