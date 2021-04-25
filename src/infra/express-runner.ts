import { Dependencies } from '@core/dependencies';
import { pipe } from 'fp-ts/lib/function';
import { Request, Response, Router } from 'express';
import { endpointToRTE, Endpoint } from './endpoint';
import { Errors } from '@core/errors';
import { handleError } from '@http/error-response';
import { handleSuccess } from '@http/success-response';
import * as E from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as TE from 'fp-ts/lib/TaskEither';

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

export const controller = (
  path: string,
  configure: (router: Router) => Router,
) => {
  const baseRouter = Router();
  const childRouter = Router();
  baseRouter.use(path, configure(childRouter));

  return baseRouter;
};
