import { CandleEndpoints } from '@core/http/candle';
import { controller, runExpress } from '@infra/express-runner';

export const CandleController = (run: ReturnType<typeof runExpress>) =>
  controller('/candles', (router) => {
    router.post(
      '/',
      run(CandleEndpoints.Fetch, (req) => req.body),
    );

    router.get(
      '/',
      run(CandleEndpoints.Get, (req) => ({
        interval: req.query.interval,
        symbol: req.query.symbol,
      })),
    );
    return router;
  });
