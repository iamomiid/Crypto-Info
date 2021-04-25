import { mkEndpoint } from '@infra/endpoint';
import { RTE, t } from '@core/prelude';
import { pipe } from 'fp-ts/lib/function';
import { Candle, CandleInterval } from '@core/models/candle';
import { notFound } from '@core/errors';
import { PairRepository } from '@core/interfaces/db/pair.repository';
import { CandleRepository } from '@core/interfaces/db/candle.repository';

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

export const Output = t.array(Candle);
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
    RTE.chainW((pair) => CandleRepository.getCandles(pair.id, input.interval)),
  );

// -------------------------------------------------------------------------------------
// Endpoint
// -------------------------------------------------------------------------------------

export const GetCandles = mkEndpoint({
  input: Input,
  output: Output,
  interactor,
});
