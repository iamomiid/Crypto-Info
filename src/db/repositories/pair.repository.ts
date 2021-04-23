import { IPairRepository } from '@core/interfaces/pair.repository';
import { Pair } from '@core/models/pair';
import { PairEntity } from '@db/entities/pair.entity';
import { findOne, save } from '@infra/db';
import { EntityManager } from 'typeorm';

export const mkPairRepo = (em: EntityManager): IPairRepository => {
  const repo = em.getRepository(PairEntity);

  return {
    findOne: findOne(
      (symbol) => repo.findOne({ where: { symbol: symbol.toUpperCase() } }),
      Pair,
    ),
    save: save((symbol) => repo.save({ symbol: symbol.toUpperCase() }), Pair),
  };
};
