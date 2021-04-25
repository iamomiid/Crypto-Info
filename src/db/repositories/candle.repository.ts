import { ICandleRepository } from '@core/interfaces/candle.repository';
import { Candle } from '@core/models/candle';
import { TE } from '@core/prelude';
import { CandleEntity } from '@db/entities/candle.entity';
import { find, findOne, fromDB, save } from '@infra/db';
import { insert } from '@infra/types/auto';
import { constVoid, flow, pipe } from 'fp-ts/lib/function';
import { EntityManager, LessThan } from 'typeorm';
import { typeError } from '@core/errors';
export const mkCandleRepo = (em: EntityManager): ICandleRepository => {
  const repo = em.getRepository(CandleEntity);

  return {
    closeCandle: flow(
      fromDB((id) => repo.update(id, { final: true })),
      TE.map(constVoid),
    ),
    findOpenCandlesBefore: find(
      (date, pairId, interval) =>
        repo.find({ where: { pairId, interval, start: LessThan(date) } }),
      Candle,
    ),
    findCandle: findOne(
      (pairId, start, end, interval) =>
        repo.findOne({ pairId, interval, start, end }),
      Candle,
    ),
    save: save((input) => repo.save(insert(Candle).encode(input)), Candle),
    update: (id, input) =>
      pipe(
        fromDB(() => repo.update(id, insert(Candle).encode(input)))(),
        TE.chainW(findOne(() => repo.findOne(id), Candle)),
        TE.chainW(TE.fromOption(() => typeError({ messages: [''] }))),
      ),
  };
};
