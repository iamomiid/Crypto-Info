import { Repositories } from '@core/dependencies';
import { mkCandleRepo } from '@db/repositories/candle.repository';
import { mkPairRepo } from '@db/repositories/pair.repository';
import { EntityManager } from 'typeorm';

export const repos = (em: EntityManager): Repositories => ({
  PairRepository: mkPairRepo(em),
  CandleRepository: mkCandleRepo(em),
});
