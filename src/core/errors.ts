import { makeADT, ofType, ADTType } from '@morphic-ts/adt';
import { flow } from 'fp-ts/lib/function';
import { formatValidationErrors } from 'io-ts-reporters';
import { E, t } from '@core/prelude';

export interface BadRequest {
  type: 'BadRequest';
  message: string;
}

export interface DatabaseError {
  type: 'DatabaseError';
  error: unknown;
}

export interface TypeError {
  type: 'TypeError';
  messages: string[];
}

export interface NotAuthenticated {
  type: 'NotAuthenticated';
  message: string;
}

export interface CriticalError {
  type: 'CriticalError';
  message: string;
  error: Error;
}

export const Errors = makeADT('type')({
  BadRequest: ofType<BadRequest>(),
  DatabaseError: ofType<DatabaseError>(),
  TypeError: ofType<TypeError>(),
  CriticalError: ofType<CriticalError>(),
  NotAuthenticated: ofType<NotAuthenticated>(),
});

export type Errors = ADTType<typeof Errors>;

export type RepoError = TypeError | DatabaseError;

export type DecodeErrors = TypeError;

export const badRequest = (message: string) =>
  Errors.as.BadRequest({ message });

export const notAuthenticated = (message: string) =>
  Errors.as.NotAuthenticated({ message });

export type DecodeTypeError<R extends DecodeErrors> = (input: {
  messages: string[];
}) => R;

export function wrapDecode<T, O>(
  codec: t.Type<T, O, unknown>,
): (i: unknown) => E.Either<TypeError, T>;
export function wrapDecode<T, O, R extends DecodeErrors>(
  codec: t.Type<T, O, unknown>,
  errorhandler?: DecodeTypeError<R>,
): (i: unknown) => E.Either<R, T>;
export function wrapDecode<T, O, R extends DecodeErrors>(
  codec: t.Type<T, O, unknown>,
  errorhandler?: DecodeTypeError<R>,
) {
  return flow(
    codec.decode,
    E.mapLeft(
      flow(formatValidationErrors, (messages) =>
        (errorhandler ?? Errors.as.TypeError)({ messages }),
      ),
    ),
  );
}
