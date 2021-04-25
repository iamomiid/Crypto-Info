import { notFound } from '@core/errors';
import { CandleFunctions } from '@core/functions/candle';
import { CandleRepository } from '@core/interfaces/db/candle.repository';
import { PairRepository } from '@core/interfaces/db/pair.repository';
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

export const handleCandle = processWS(BinanceWSInputCandle, (input) =>
  pipe(
    PairRepository.findOne(input.symbol),
    RTE.chainW(
      RTE.fromOption(() =>
        notFound({
          entity: 'pair',
          message: 'Pair not found',
          query: input.symbol,
        }),
      ),
    ),
    RTE.chainW((pair) =>
      pipe(
        closePreviousCandles(input, pair.id),
        RTE.chainW(() => CandleFunctions.saveNewCandle(input, pair.id)),
      ),
    ),
  ),
);
