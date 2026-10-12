import { Upload } from '../entities/Upload';
import { UploadStatusValue } from '../value-objects/UploadStatus';

export interface ListUploadsParams {
  page: number;
  limit: number;
}

export interface IUploadRepository {
  save(upload: Upload): Promise<void>;
  findById(id: string): Promise<Upload | null>;
  list(params: ListUploadsParams): Promise<{ items: Upload[]; total: number }>;
  countByStatus(): Promise<Record<UploadStatusValue, number>>;
}
