import { RepoError } from '@core/errors';
import { Candle, CandleId, CandleInterval } from '@core/models/candle';
import { PairId } from '@core/models/pair';
import { O, TE } from '@core/prelude';
import { extractServiceOrRepo } from '@infra/reader';
import { InsertType } from '@infra/types/auto';

export interface ICandleRepository {
  findOpenCandlesBefore: (
    date: Date,
    pair: PairId,
    interval: CandleInterval,
  ) => TE.TaskEither<RepoError, Candle[]>;
  closeCandle: (id: CandleId) => TE.TaskEither<RepoError, void>;
  findCandle: (
    pair: PairId,
    start: Date,
    end: Date,
    interval: CandleInterval,
  ) => TE.TaskEither<RepoError, O.Option<Candle>>;
  save: (candle: InsertType<Candle>) => TE.TaskEither<RepoError, Candle>;
  update: (
    id: CandleId,
    candle: InsertType<Candle>,
  ) => TE.TaskEither<RepoError, Candle>;
}

export const CandleRepository = extractServiceOrRepo('CandleRepository', {
  closeCandle: null,
  findCandle: null,
  findOpenCandlesBefore: null,
  save: null,
  update: null,
});
