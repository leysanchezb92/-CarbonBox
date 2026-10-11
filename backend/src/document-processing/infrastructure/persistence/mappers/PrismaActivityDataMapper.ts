import { ActivityData } from '../../../domain/entities/ActivityData';

export interface ActivityDataRecord {
  id: string;
  uploadId: string;
  category: string;
  amount: number;
  unit: string;
  date: Date;
  createdAt: Date;
}

export class PrismaActivityDataMapper {
  static toDomain(record: ActivityDataRecord): ActivityData {
    return ActivityData.reconstitute({
      id: record.id,
      uploadId: record.uploadId,
      category: record.category,
      amount: record.amount,
      unit: record.unit,
      date: record.date,
      createdAt: record.createdAt,
    });
  }

  static toPersistence(item: ActivityData): ActivityDataRecord {
    return {
      id: item.id,
      uploadId: item.uploadId,
      category: item.category,
      amount: item.amount,
      unit: item.unit,
      date: item.date,
      createdAt: item.createdAt,
    };
  }
}
