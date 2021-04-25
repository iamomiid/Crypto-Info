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
  // '5m': null,
  // '1d': null,
});
export type CandleInterval = t.TypeOf<typeof CandleInterval>;

// -------------------------------------------------------------------------------------
// Candle
// -------------------------------------------------------------------------------------

export const RawCandle = t.type({
  high: t.numberOrString,
  low: t.numberOrString,
  open: t.numberOrString,
  close: t.numberOrString,
  interval: CandleInterval,
  start: t.date,
  end: t.date,
  final: t.boolean,
});
export type RawCandle = t.TypeOf<typeof RawCandle>;

export const Candle = t.type({
  id: auto(CandleId),
  pairId: PairId,
  pair: t.optionFromNullable(Pair),
  rawCandle: RawCandle,
});
export type Candle = t.TypeOf<typeof Candle>;

// -------------------------------------------------------------------------------------
// Binance Input Candle
// -------------------------------------------------------------------------------------
export const BinanceWSInputCandle = t.type({
  startTime: t.DateFromNumber,
  open: t.numberOrString,
  high: t.numberOrString,
  low: t.numberOrString,
  close: t.numberOrString,
  volume: t.numberOrString,
  closeTime: t.DateFromNumber,
  symbol: t.string,
  quoteVolume: t.numberOrString,
  interval: CandleInterval,
  isFinal: t.boolean,
  trades: t.numberOrString,
  buyVolume: t.numberOrString,
});
export type BinanceWSInputCandle = t.TypeOf<typeof BinanceWSInputCandle>;
