import { notFound } from '@core/errors';
import { CandleRepository } from '@core/interfaces/candle.repository';
import { PairRepository } from '@core/interfaces/pair.repository';
import { BinanceWSInputCandle, Candle } from '@core/models/candle';
import { Pair, PairId } from '@core/models/pair';
import { A, O, RTE } from '@core/prelude';
import { InsertType } from '@infra/types/auto';
import { processWS } from '@infra/websocket-runner';
import { pipe } from 'fp-ts/lib/function';

const closeCandle = (candle: Candle) => CandleRepository.closeCandle(candle.id);

const closePreviousCandles = (input: BinanceWSInputCandle, pairId: PairId) =>
  pipe(
    CandleRepository.findOpenCandlesBefore(
      input.startTime,
      pairId,
      input.interval,
    ),
    RTE.chainW(A.traverse(RTE.Monad)(closeCandle)),
  );

const transformToInt = (input: number) => Math.floor(input * Math.pow(10, 8));

const transformCandle = (
  input: BinanceWSInputCandle,
  pairId: PairId,
): InsertType<Candle> => ({
  close: transformToInt(input.close),
  open: transformToInt(input.open),
  low: transformToInt(input.low),
  high: transformToInt(input.high),
  final: input.isFinal,
  interval: input.interval,
  pairId,
  start: input.startTime,
  end: input.closeTime,
});

const saveNewCandle = (input: BinanceWSInputCandle, pairId: PairId) =>
  pipe(
    CandleRepository.findCandle(
      pairId,
      input.startTime,
      input.closeTime,
      input.interval,
    ),
    RTE.chainW((candle) =>
      pipe(
        candle,
        O.map((currentCandle) =>
          CandleRepository.update(
            currentCandle.id,
            transformCandle(input, pairId),
          ),
        ),
        O.getOrElseW(() =>
          CandleRepository.save(transformCandle(input, pairId)),
        ),
        RTE.widen,
      ),
    ),
  );

export const handleCandle = processWS(BinanceWSInputCandle, (input) =>
  pipe(
    PairRepository.findOne(input.symbol),
    RTE.chainW(
      RTE.fromOption(() => notFound({ entity: 'pair', query: input.symbol })),
    ),
    RTE.chainW((pair) =>
      pipe(
        closePreviousCandles(input, pair.id),
        RTE.chainW(() => saveNewCandle(input, pair.id)),
      ),
    ),
  ),
);
