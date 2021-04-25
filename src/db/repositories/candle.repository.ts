import { ICandleRepository } from '@core/interfaces/db/candle.repository';
import { Candle } from '@core/models/candle';
import { TE } from '@core/prelude';
import { CandleEntity } from '@db/entities/candle.entity';
import { find, findOne, fromDB, save } from '@infra/db';
import { insert } from '@infra/types/auto';
import { constVoid, flow, pipe } from 'fp-ts/lib/function';
import { EntityManager, LessThan } from 'typeorm';
import { typeError } from '@core/errors';
import { withMap } from '@infra/types/with-map';

const CandleDB = withMap<typeof Candle, Partial<CandleEntity>>(
  Candle,
  (entity) => ({
    id: entity.id!,
    pair: entity.pair!,
    pairId: entity.pairId!,
    rawCandle: {
      close: entity.close!,
      end: entity.end!,
      final: entity.final!,
      high: entity.high!,
      interval: entity.interval!,
      low: entity.low!,
      open: entity.open!,
      start: entity.start!,
    },
  }),
  (codec) => ({
    id: codec.id,
    close: codec.rawCandle.close,
    high: codec.rawCandle.high,
    open: codec.rawCandle.open,
    low: codec.rawCandle.low,
    interval: codec.rawCandle.interval,
    start: codec.rawCandle.start,
    end: codec.rawCandle.end,
    final: codec.rawCandle.final,
    pairId: codec.pairId,
  }),
);

export const mkCandleRepo = (em: EntityManager): ICandleRepository => {
  const repo = em.getRepository(CandleEntity);

  return {
    closeCandle: flow(
      fromDB((id) => repo.update(id, { final: true })),
      TE.map(constVoid),
    ),
    findOpenCandlesBefore: find(
      (date, pairId, interval) =>
        repo.find({
          where: { pairId, interval, start: LessThan(date), final: false },
        }),
      CandleDB,
    ),
    findCandle: findOne(
      (pairId, start, end, interval) =>
        repo.findOne({ pairId, interval, start, end }),
      CandleDB,
    ),
    save: save((input) => repo.save(insert(CandleDB).encode(input)), CandleDB),
    update: (id, input) =>
      pipe(
        fromDB(() => repo.update(id, insert(CandleDB).encode(input)))(),
        TE.chainW(findOne(() => repo.findOne(id), CandleDB)),
        TE.chainW(TE.fromOption(() => typeError({ messages: [''] }))),
      ),
    getCandles: find(
      (pairId, interval) => repo.find({ pairId, interval }),
      CandleDB,
    ),
  };
};
