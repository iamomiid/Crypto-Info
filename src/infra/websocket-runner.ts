import { Dependencies } from '@core/dependencies';
import { Errors, wrapDecode } from '@core/errors';
import { E, RTE, t } from '@core/prelude';
import { ReaderTaskEither } from '@core/prelude/rte';
import { pipe } from 'fp-ts/lib/function';
import { TaskEither } from 'fp-ts/lib/TaskEither';

export const processWS = <T, O, R, E, A>(
  codec: t.Type<T, O, unknown>,
  rte: (input: T) => RTE.ReaderTaskEither<R, E, A>,
) => (input: unknown) =>
  pipe(input, wrapDecode(codec), RTE.fromEither, RTE.chainW(rte));
