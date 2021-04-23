import { t } from '@core/prelude';

export const Pair = t.type({
  symbol: t.string,
});
export type Pair = t.TypeOf<typeof Pair>;
