import { BinanceError, TypeError } from '@core/errors';
import { RawCandle, CandleInterval } from '@core/models/candle';
import { TE } from '@core/prelude';
import { extractServiceOrRepo } from '@infra/reader';

export interface IBinanceService {
  fetchCandles: (
    symbol: string,
    interval: CandleInterval,
  ) => TE.TaskEither<BinanceError | TypeError, RawCandle[]>;
}

export const BinanceService = extractServiceOrRepo('BinanceService', {
  fetchCandles: null,
});
