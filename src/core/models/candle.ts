import { Pair, PairId } from '@core/models/pair';
import { t } from '@core/prelude';
import { auto } from '@infra/types/auto';

// -------------------------------------------------------------------------------------
// Candle Id
// -------------------------------------------------------------------------------------
interface CandleIdBrand {
  readonly CandleId: unique symbol;
}

export const CandleId = t.brand(
  t.number,
  (x): x is t.Branded<number, CandleIdBrand> => Number.isInteger(x),
  'CandleId',
);
export type CandleId = t.TypeOf<typeof CandleId>;

// -------------------------------------------------------------------------------------
// Candle Interval
// -------------------------------------------------------------------------------------

export const CandleInterval = t.keyof({
  '1m': null,
  '5m': null,
  '1d': null,
});
export type CandleInterval = t.TypeOf<typeof CandleInterval>;

// -------------------------------------------------------------------------------------
// Candle
// -------------------------------------------------------------------------------------

export const Candle = t.type({
  id: auto(CandleId),
  high: t.number,
  low: t.number,
  open: t.number,
  close: t.number,
  pairId: PairId,
  pair: auto(Pair),
  interval: CandleInterval,
  start: t.date,
  end: t.date,
  final: t.boolean,
});
export type Candle = t.TypeOf<typeof Candle>;

// -------------------------------------------------------------------------------------
// Binance Input Candle
// -------------------------------------------------------------------------------------
export const BinanceWSInputCandle = t.type({
  startTime: t.DateFromNumber,
  open: t.NumberFromString,
  high: t.NumberFromString,
  low: t.NumberFromString,
  close: t.NumberFromString,
  volume: t.NumberFromString,
  closeTime: t.DateFromNumber,
  symbol: t.string,
  quoteVolume: t.NumberFromString,
  interval: CandleInterval,
  isFinal: t.boolean,
  trades: t.number,
  buyVolume: t.NumberFromString,
});
export type BinanceWSInputCandle = t.TypeOf<typeof BinanceWSInputCandle>;
