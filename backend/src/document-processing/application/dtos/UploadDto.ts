import { Upload } from '../../domain/entities/Upload';

export interface UploadDto {
  id: string;
  fileName: string;
  status: string;
  totalRows: number | null;
  processedRows: number | null;
  failedRows: number | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedUploadsDto {
  data: UploadDto[];
  total: number;
  page: number;
  limit: number;
}

export function toUploadDto(upload: Upload): UploadDto {
  return {
    id: upload.id,
    fileName: upload.fileName.value,
    status: upload.status.value,
    totalRows: upload.totalRows,
    processedRows: upload.processedRows,
    failedRows: upload.failedRows,
    errorMessage: upload.errorMessage,
    createdAt: upload.createdAt.toISOString(),
    updatedAt: upload.updatedAt.toISOString(),
  };
}
