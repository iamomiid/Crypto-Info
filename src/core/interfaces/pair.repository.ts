import { RepoError } from '@core/errors';
import { Pair } from '@core/models/pair';
import { TE, O } from '@core/prelude';
import { extractServiceOrRepo } from '@infra/reader';

export interface IPairRepository {
  findOne: (symbol: string) => TE.TaskEither<RepoError, O.Option<Pair>>;
  save: (symbol: string) => TE.TaskEither<RepoError, Pair>;
}

export const PairRepository = extractServiceOrRepo('PairRepository', {
  findOne: null,
  save: null,
});
