import { CandleRepository } from '@core/interfaces/db/candle.repository';
import { BinanceWSInputCandle, Candle, RawCandle } from '@core/models/candle';
import { PairId } from '@core/models/pair';
import { RTE, O } from '@core/prelude';
import { InsertType } from '@infra/types/auto';
import { flow, pipe } from 'fp-ts/lib/function';

// -------------------------------------------------------------------------------------
// Transform String to Int
// -------------------------------------------------------------------------------------

const transformStringToInt = (input: number | string) =>
  Math.floor(
    (typeof input == 'string' ? parseFloat(input) : input) * Math.pow(10, 8),
  );

// -------------------------------------------------------------------------------------
// Save New Candle
// -------------------------------------------------------------------------------------

const transformBinanceCandle = (
  input: BinanceWSInputCandle,
  pairId: PairId,
): InsertType<Candle> => ({
  rawCandle: {
    close: CandleFunctions.transformStringToInt(input.close),
    open: CandleFunctions.transformStringToInt(input.open),
    low: CandleFunctions.transformStringToInt(input.low),
    high: CandleFunctions.transformStringToInt(input.high),
    start: input.startTime,
    end: input.closeTime,
    interval: input.interval,
    final: input.isFinal,
  },
  pairId,
  pair: O.none,
});

const transformRawCandle = (
  rawCandle: RawCandle,
  pairId: PairId,
): InsertType<Candle> => ({ rawCandle, pairId, pair: O.none });

const saveNewCandle = (
  input: BinanceWSInputCandle | RawCandle,
  pairId: PairId,
) =>
  pipe(
    BinanceWSInputCandle.is(input)
      ? transformBinanceCandle(input, pairId)
      : transformRawCandle(input, pairId),
    (candle) =>
      pipe(
        CandleRepository.findCandle(
          pairId,
          candle.rawCandle.start,
          candle.rawCandle.end,
          candle.rawCandle.interval,
        ),
        RTE.chainW(
          flow(
            O.map((currentCandle) =>
              CandleRepository.update(currentCandle.id, {
                ...currentCandle,
                ...candle,
              }),
            ),
            O.getOrElseW(() => CandleRepository.save(candle)),
            RTE.widen,
          ),
        ),
      ),
  );

// -------------------------------------------------------------------------------------
// Export
// -------------------------------------------------------------------------------------

export const CandleFunctions = { transformStringToInt, saveNewCandle };
