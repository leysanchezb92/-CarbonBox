import { DomainError } from '../../../shared/domain/DomainError';

export class InvalidFileNameError extends DomainError {
  readonly code = 'INVALID_FILE_NAME';
}

export class InvalidUploadStatusError extends DomainError {
  readonly code = 'INVALID_UPLOAD_STATUS';
}

export class InvalidStatusTransitionError extends DomainError {
  readonly code = 'INVALID_STATUS_TRANSITION';
}
