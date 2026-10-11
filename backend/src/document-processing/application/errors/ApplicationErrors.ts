import { DomainError } from '../../../shared/domain/DomainError';

export class UploadNotFoundError extends DomainError {
  readonly code = 'UPLOAD_NOT_FOUND';
}

export class EmptyFileError extends DomainError {
  readonly code = 'EMPTY_FILE';
}

export class InvalidPaginationError extends DomainError {
  readonly code = 'INVALID_PAGINATION';
}
