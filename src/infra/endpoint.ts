/* istanbul ignore file */

import * as t from 'io-ts';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import { Errors, BadRequest, badRequest } from '@core/errors';
import { pipe } from 'fp-ts/lib/function';

export type Endpoint<
  R,
  E extends Errors,
  I extends t.Mixed,
  O extends t.Mixed
> = {
  input: I;
  output: O;
  interactor: (input: t.TypeOf<I>) => RTE.ReaderTaskEither<R, E, t.TypeOf<O>>;
};

export const mkEndpoint = <
  R,
  E extends Errors,
  I extends t.Mixed,
  O extends t.Mixed
>(
  e: Endpoint<R, E, I, O>,
) => e;

export const endpointToRTE = <
  I extends t.Mixed,
  O extends t.Mixed,
  R,
  E extends Errors
>(
  endpoint: Endpoint<R, E, I, O>,
) => (
  input: Record<keyof t.OutputOf<I>, unknown>,
): RTE.ReaderTaskEither<R, E | BadRequest, t.TypeOf<O>> =>
  pipe(
    input,
    endpoint.input.decode,
    RTE.fromEither,
    RTE.mapLeft((x) => badRequest(x.join('\n'))),
    RTE.chainW(endpoint.interactor),
    RTE.map(endpoint.output.encode),
  );
