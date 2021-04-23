import { Dependencies } from '@core/dependencies';
import { pipe } from 'fp-ts/lib/function';
import { Request, Response } from 'express';
import { endpointToRTE, Endpoint } from './endpoint';
import { Errors } from '@core/errors';
import { handleError } from '@http/error-response';
import { handleSuccess } from '@http/success-response';
import { E, RTE, t, TE } from '@core/prelude';

export type RunEndpoint = ReturnType<typeof runExpress>;

export const runExpress = (
  provider: (
    req: Request,
  ) => <A>(
    rte: RTE.ReaderTaskEither<Dependencies, Errors, A>,
  ) => TE.TaskEither<Errors, A>,
) => <I extends t.Mixed, O extends t.Mixed>(
  endpoint: Endpoint<Dependencies, Errors, I, O>,
  supply: (req: Request) => Record<keyof t.OutputOf<I>, unknown>,
) => (req: Request, res: Response) =>
  pipe(supply(req), endpointToRTE(endpoint), provider(req))().then(
    E.fold(handleError(req, res), handleSuccess(req, res)),
  );
