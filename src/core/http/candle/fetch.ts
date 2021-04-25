import { mkEndpoint } from '@infra/endpoint';
import { A, O, RTE, t } from '@core/prelude';
import { pipe } from 'fp-ts/lib/function';
import { CandleInterval, RawCandle } from '@core/models/candle';
import { PairRepository } from '@core/interfaces/db/pair.repository';
import { notFound } from '@core/errors';
import { Pair } from '@core/models/pair';
import { BinanceService } from '@core/interfaces/external/binance.service';
import { CandleRepository } from '@core/interfaces/db/candle.repository';
import { CandleFunctions } from '@core/functions/candle';

// -------------------------------------------------------------------------------------
// Input
// -------------------------------------------------------------------------------------

export const Input = t.type({
  symbol: t.string,
  interval: CandleInterval,
});
export type Input = t.TypeOf<typeof Input>;

// -------------------------------------------------------------------------------------
// Output
// -------------------------------------------------------------------------------------

export const Output = t.type({ message: t.string });
export type Output = t.TypeOf<typeof Output>;

// -------------------------------------------------------------------------------------
// Interactor
// -------------------------------------------------------------------------------------

const interactor = (input: Input) =>
  pipe(
    PairRepository.findOne(input.symbol),
    RTE.chainW(
      RTE.fromOption(() =>
        notFound({
          entity: 'pair',
          message: 'Symbol not found',
          query: input.symbol,
        }),
      ),
    ),
    RTE.chainW(fetchAndSave(input)),
    RTE.map(() => ({ message: 'Saved Successfully' })),
  );

// -------------------------------------------------------------------------------------
// Endpoint
// -------------------------------------------------------------------------------------

export const FetchCandles = mkEndpoint({
  input: Input,
  output: Output,
  interactor,
});

// -------------------------------------------------------------------------------------
// Private Function
// -------------------------------------------------------------------------------------
const saveRawCandle = (pair: Pair) => (rawCandle: RawCandle) =>
  CandleFunctions.saveNewCandle(rawCandle, pair.id);

const fetchAndSave = (input: Input) => (pair: Pair) =>
  pipe(
    BinanceService.fetchCandles(pair.symbol, input.interval),
    RTE.chainW(A.traverse(RTE.Monad)(saveRawCandle(pair))),
  );
