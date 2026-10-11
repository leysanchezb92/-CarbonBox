import { ActivityData } from '../entities/ActivityData';

export interface IActivityDataRepository {
  saveMany(items: ActivityData[]): Promise<void>;
  findByUploadId(uploadId: string): Promise<ActivityData[]>;
  deleteByUploadId(uploadId: string): Promise<void>;
}
