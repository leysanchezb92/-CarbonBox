import { Either } from '../../../shared/domain/Either';
import { InvalidUploadStatusError } from '../errors/UploadErrors';

export const UPLOAD_STATUSES = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] as const;
export type UploadStatusValue = (typeof UPLOAD_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<UploadStatusValue, UploadStatusValue[]> = {
  PENDING: ['PROCESSING', 'FAILED'],
  PROCESSING: ['COMPLETED', 'FAILED'],
  COMPLETED: [],
  FAILED: [],
};

export class UploadStatus {
  private constructor(readonly value: UploadStatusValue) {}

  static create(value: string): Either<InvalidUploadStatusError, UploadStatus> {
    if (!(UPLOAD_STATUSES as readonly string[]).includes(value)) {
      return Either.left(new InvalidUploadStatusError(`Estado inválido: "${value}"`));
    }
    return Either.right(new UploadStatus(value as UploadStatusValue));
  }

  static pending(): UploadStatus {
    return new UploadStatus('PENDING');
  }
  static processing(): UploadStatus {
    return new UploadStatus('PROCESSING');
  }
  static completed(): UploadStatus {
    return new UploadStatus('COMPLETED');
  }
  static failed(): UploadStatus {
    return new UploadStatus('FAILED');
  }

  canTransitionTo(next: UploadStatus): boolean {
    return ALLOWED_TRANSITIONS[this.value].includes(next.value);
  }

  equals(other: UploadStatus): boolean {
    return this.value === other.value;
  }
}
