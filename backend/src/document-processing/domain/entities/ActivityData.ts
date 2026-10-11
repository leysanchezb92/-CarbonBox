import { randomUUID } from 'node:crypto';
import { Either } from '../../../shared/domain/Either';
import { InvalidActivityDataError } from '../errors/ActivityDataErrors';

export interface RawActivityRow {
  category: string;
  amount: string;
  unit: string;
  date: string;
}

export interface ActivityDataProps {
  id: string;
  uploadId: string;
  category: string;
  amount: number;
  unit: string;
  date: Date;
  createdAt: Date;
}

const AMOUNT_PATTERN = /^\d+(\.\d+)?$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export class ActivityData {
  private constructor(private readonly props: ActivityDataProps) {}

  static create(uploadId: string, raw: RawActivityRow): Either<InvalidActivityDataError, ActivityData> {
    const category = raw.category.trim();
    const unit = raw.unit.trim();
    const amountText = raw.amount.trim();
    const dateText = raw.date.trim();

    if (category === '') {
      return Either.left(new InvalidActivityDataError('category no puede estar vacío'));
    }
    if (unit === '') {
      return Either.left(new InvalidActivityDataError('unit no puede estar vacío'));
    }

    const amount = Number(amountText);
    if (!AMOUNT_PATTERN.test(amountText) || !Number.isFinite(amount) || amount <= 0) {
      return Either.left(
        new InvalidActivityDataError(`amount debe ser un número positivo (recibido: "${amountText}")`),
      );
    }

    const date = ActivityData.parseDate(dateText);
    if (date === null) {
      return Either.left(
        new InvalidActivityDataError(
          `date debe ser una fecha válida con formato YYYY-MM-DD (recibido: "${dateText}")`,
        ),
      );
    }

    return Either.right(
      new ActivityData({
        id: randomUUID(),
        uploadId,
        category,
        amount,
        unit,
        date,
        createdAt: new Date(),
      }),
    );
  }

  static reconstitute(props: ActivityDataProps): ActivityData {
    return new ActivityData(props);
  }

  private static parseDate(text: string): Date | null {
    const match = DATE_PATTERN.exec(text);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    const isRealDate =
      date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
    return isRealDate ? date : null;
  }

  get id(): string { return this.props.id; }
  get uploadId(): string { return this.props.uploadId; }
  get category(): string { return this.props.category; }
  get amount(): number { return this.props.amount; }
  get unit(): string { return this.props.unit; }
  get date(): Date { return this.props.date; }
  get createdAt(): Date { return this.props.createdAt; }
}
