import { DomainError } from '../../../shared/domain/DomainError';

export class InvalidActivityDataError extends DomainError {
  readonly code = 'INVALID_ACTIVITY_DATA';
}
