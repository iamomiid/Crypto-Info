import { IBinanceService } from '@core/interfaces/external/binance.service';
import { A, t, TE } from '@core/prelude';
import binance, {
  Binance,
  CandleChartInterval,
  CandleChartResult,
} from 'binance-api-node';
import { flow, pipe } from 'fp-ts/lib/function';
import { binanceError, wrapDecode } from '@core/errors';
import { RawCandle } from '@core/models/candle';
import { CandleFunctions } from '@core/functions/candle';
// const fetchCandles = (client: Binance) => pipe(TE.tryCatchK((symbol, interval) => ));

const charResultToRawCandle = (x: CandleChartResult): RawCandle => ({
  close: CandleFunctions.transformStringToInt(x.close),
  end: new Date(x.closeTime),
  high: CandleFunctions.transformStringToInt(x.high),
  final: true,
  interval: '1m',
  low: CandleFunctions.transformStringToInt(x.low),
  open: CandleFunctions.transformStringToInt(x.open),
  start: new Date(x.openTime),
});

export const mkBinanceService = (): IBinanceService => {
  const client = binance();

  return {
    fetchCandles: flow(
      TE.tryCatchK(
        (symbol, interval) =>
          client.candles({ symbol, interval: interval as CandleChartInterval }),
        (error) => binanceError({ error }),
      ),
      TE.map(A.map(charResultToRawCandle)),
      TE.chainEitherKW(wrapDecode(t.array(RawCandle))),
    ),
  };
};
