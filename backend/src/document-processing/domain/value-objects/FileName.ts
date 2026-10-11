import { Either } from '../../../shared/domain/Either';
import { InvalidFileNameError } from '../errors/UploadErrors';

export class FileName {
  private constructor(readonly value: string) {}

  static create(raw: string): Either<InvalidFileNameError, FileName> {
    const name = (raw ?? '').trim();

    if (name.length === 0) {
      return Either.left(new InvalidFileNameError('El nombre del archivo no puede estar vacío'));
    }
    if (name.length > 255) {
      return Either.left(new InvalidFileNameError('El nombre del archivo excede 255 caracteres'));
    }
    if (/[\\/]/.test(name)) {
      return Either.left(new InvalidFileNameError('El nombre del archivo no puede contener / ni \\'));
    }
    if (!name.toLowerCase().endsWith('.csv')) {
      return Either.left(new InvalidFileNameError('Solo se permiten archivos .csv'));
    }
    return Either.right(new FileName(name));
  }

  equals(other: FileName): boolean {
    return this.value === other.value;
  }
}
