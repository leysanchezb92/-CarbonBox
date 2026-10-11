import { Either } from '../domain/Either';

export interface IQueryHandler<TQuery, TResult> {
  execute(query: TQuery): Promise<Either<Error, TResult>>;
}
