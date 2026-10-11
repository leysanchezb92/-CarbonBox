import { PrismaClient } from '../../../../../generated/prisma/client';
import { Upload } from '../../../domain/entities/Upload';
import {
  IUploadRepository,
  ListUploadsParams,
} from '../../../domain/repositories/IUploadRepository';
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
}
