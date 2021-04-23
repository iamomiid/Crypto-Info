import { Repositories } from '@core/dependencies';
import { mkPairRepo } from '@db/repositories/pair.repository';
import { EntityManager } from 'typeorm';

export const repos = (em: EntityManager): Repositories => ({
  PairRepository: mkPairRepo(em),
});
