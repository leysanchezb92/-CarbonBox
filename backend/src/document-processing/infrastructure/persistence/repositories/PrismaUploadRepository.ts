import { PrismaClient } from '../../../../../generated/prisma/client';
import { Upload } from '../../../domain/entities/Upload';
import {
  IUploadRepository,
  ListUploadsParams,
} from '../../../domain/repositories/IUploadRepository';
import { UploadStatusValue } from '../../../domain/value-objects/UploadStatus';
import { PrismaUploadMapper } from '../mappers/PrismaUploadMapper';

export class PrismaUploadRepository implements IUploadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(upload: Upload): Promise<void> {
    const data = PrismaUploadMapper.toPersistence(upload);
    const { id, ...fieldsToUpdate } = data;

    await this.prisma.upload.upsert({
      where: { id },
      create: data,
      update: fieldsToUpdate,
    });
  }

  async findById(id: string): Promise<Upload | null> {
    const record = await this.prisma.upload.findUnique({ where: { id } });
    return record ? PrismaUploadMapper.toDomain(record) : null;
  }

  async list(params: ListUploadsParams): Promise<{ items: Upload[]; total: number }> {
    const { page, limit } = params;

    const [records, total] = await this.prisma.$transaction([
      this.prisma.upload.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.upload.count(),
    ]);

    return { items: records.map((record) => PrismaUploadMapper.toDomain(record)), total };
  }

  async countByStatus(): Promise<Record<UploadStatusValue, number>> {
    const groups = await this.prisma.upload.groupBy({ by: ['status'], _count: { _all: true } });

    const counts: Record<UploadStatusValue, number> = { PENDING: 0, PROCESSING: 0, COMPLETED: 0, FAILED: 0 };
    for (const group of groups) {
      if (group.status in counts) {
        counts[group.status as UploadStatusValue] = group._count._all;
      }
    }
    return counts;
  }
}
