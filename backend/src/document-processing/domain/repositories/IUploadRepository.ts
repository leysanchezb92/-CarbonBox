import { Upload } from '../entities/Upload';

export interface ListUploadsParams {
  page: number;
  limit: number;
}

export interface IUploadRepository {
  save(upload: Upload): Promise<void>;
  findById(id: string): Promise<Upload | null>;
  list(params: ListUploadsParams): Promise<{ items: Upload[]; total: number }>;
}
