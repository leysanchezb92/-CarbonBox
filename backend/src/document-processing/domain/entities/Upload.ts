import { randomUUID } from 'crypto';
import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { Either } from '../../../shared/domain/Either';
import { InvalidStatusTransitionError } from '../errors/UploadErrors';
import { FileName } from '../value-objects/FileName';
import { UploadStatus } from '../value-objects/UploadStatus';

export interface UploadProps {
  id: string;
  fileName: FileName;
  fileUrl: string;
  status: UploadStatus;
  userId: string;
  totalRows: number | null;
  processedRows: number | null;
  failedRows: number | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUploadInput {
  fileName: FileName;
  fileUrl: string;
  userId: string;
}

export interface ProcessingResult {
  totalRows: number;
  processedRows: number;
  failedRows: number;
}

export class Upload extends AggregateRoot<UploadProps> {
  private constructor(props: UploadProps) {
    super(props);
  }

  static create(input: CreateUploadInput): Upload {
    const now = new Date();
    return new Upload({
      id: randomUUID(),
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      status: UploadStatus.pending(),
      userId: input.userId,
      totalRows: null,
      processedRows: null,
      failedRows: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: UploadProps): Upload {
    return new Upload(props);
  }

  get fileName(): FileName { return this.props.fileName; }
  get fileUrl(): string { return this.props.fileUrl; }
  get status(): UploadStatus { return this.props.status; }
  get userId(): string { return this.props.userId; }
  get totalRows(): number | null { return this.props.totalRows; }
  get processedRows(): number | null { return this.props.processedRows; }
  get failedRows(): number | null { return this.props.failedRows; }
  get errorMessage(): string | null { return this.props.errorMessage; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  startProcessing(): Either<InvalidStatusTransitionError, void> {
    return this.transitionTo(UploadStatus.processing());
  }

  complete(result: ProcessingResult): Either<InvalidStatusTransitionError, void> {
    const transition = this.transitionTo(UploadStatus.completed());
    if (transition.isLeft()) {
      return transition;
    }
    this.props.totalRows = result.totalRows;
    this.props.processedRows = result.processedRows;
    this.props.failedRows = result.failedRows;
    return Either.right(undefined);
  }

  fail(errorMessage: string): Either<InvalidStatusTransitionError, void> {
    const transition = this.transitionTo(UploadStatus.failed());
    if (transition.isLeft()) {
      return transition;
    }
    this.props.errorMessage = errorMessage;
    return Either.right(undefined);
  }

  private transitionTo(next: UploadStatus): Either<InvalidStatusTransitionError, void> {
    if (!this.props.status.canTransitionTo(next)) {
      return Either.left(
        new InvalidStatusTransitionError(
          `No se puede pasar de ${this.props.status.value} a ${next.value}`,
        ),
      );
    }
    this.props.status = next;
    this.props.updatedAt = new Date();
    return Either.right(undefined);
  }
}
