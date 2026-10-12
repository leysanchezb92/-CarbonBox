import { ActivityData } from '../../domain/entities/ActivityData';

export interface ActivityDataDto {
  category: string;
  amount: number;
  unit: string;
  date: string;
}

export interface UploadResultsDto {
  data: ActivityDataDto[];
}

export function toActivityDataDto(item: ActivityData): ActivityDataDto {
  return {
    category: item.category,
    amount: item.amount,
    unit: item.unit,
    date: item.date.toISOString().slice(0, 10),
  };
}
