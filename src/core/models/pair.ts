import { t } from '@core/prelude';

// -------------------------------------------------------------------------------------
// Pair Is
// -------------------------------------------------------------------------------------
interface PairIdBrand {
  readonly PairId: unique symbol;
}

export const PairId = t.brand(
  t.number,
  (x): x is t.Branded<number, PairIdBrand> => Number.isInteger(x),
  'PairId',
);
export type PairId = t.TypeOf<typeof PairId>;

// -------------------------------------------------------------------------------------
// Pairs
// -------------------------------------------------------------------------------------

export const Pair = t.type({
  id: PairId,
  symbol: t.string,
});
export type Pair = t.TypeOf<typeof Pair>;
