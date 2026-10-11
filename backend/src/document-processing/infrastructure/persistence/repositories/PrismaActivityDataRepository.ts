import { PrismaClient } from '../../../../../generated/prisma/client';
import { ActivityData } from '../../../domain/entities/ActivityData';
import { IActivityDataRepository } from '../../../domain/repositories/IActivityDataRepository';
import { PrismaActivityDataMapper } from '../mappers/PrismaActivityDataMapper';

const CHUNK_SIZE = 1000;

export class PrismaActivityDataRepository implements IActivityDataRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveMany(items: ActivityData[]): Promise<void> {
    for (let start = 0; start < items.length; start += CHUNK_SIZE) {
      const chunk = items
        .slice(start, start + CHUNK_SIZE)
        .map((item) => PrismaActivityDataMapper.toPersistence(item));
      await this.prisma.activityData.createMany({ data: chunk });
    }
  }

  async findByUploadId(uploadId: string): Promise<ActivityData[]> {
    const records = await this.prisma.activityData.findMany({
      where: { uploadId },
      orderBy: [{ date: 'asc' }, { category: 'asc' }],
    });
    return records.map((record) => PrismaActivityDataMapper.toDomain(record));
  }

  async deleteByUploadId(uploadId: string): Promise<void> {
    await this.prisma.activityData.deleteMany({ where: { uploadId } });
  }
}
