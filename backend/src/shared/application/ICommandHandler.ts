import { Either } from '../domain/Either';

export interface ICommandHandler<TCommand, TResult> {
  execute(command: TCommand): Promise<Either<Error, TResult>>;
}
