import { Upload } from '../../../domain/entities/Upload';
import { FileName } from '../../../domain/value-objects/FileName';
import { UploadStatus } from '../../../domain/value-objects/UploadStatus';

export interface UploadRecord {
  id: string;
  fileName: string;
  fileUrl: string;
  status: string;
  userId: string;
  totalRows: number | null;
  processedRows: number | null;
  failedRows: number | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PrismaUploadMapper {
  static toDomain(record: UploadRecord): Upload {
    const fileName = FileName.create(record.fileName);
    const status = UploadStatus.create(record.status);

    if (fileName.isLeft()) throw fileName.value;
    if (status.isLeft()) throw status.value;

    return Upload.reconstitute({
      id: record.id,
      fileName: fileName.value,
      fileUrl: record.fileUrl,
      status: status.value,
      userId: record.userId,
      totalRows: record.totalRows,
      processedRows: record.processedRows,
      failedRows: record.failedRows,
      errorMessage: record.errorMessage,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(upload: Upload): UploadRecord {
    return {
      id: upload.id,
      fileName: upload.fileName.value,
      fileUrl: upload.fileUrl,
      status: upload.status.value,
      userId: upload.userId,
      totalRows: upload.totalRows,
      processedRows: upload.processedRows,
      failedRows: upload.failedRows,
      errorMessage: upload.errorMessage,
      createdAt: upload.createdAt,
      updatedAt: upload.updatedAt,
    };
  }
}
