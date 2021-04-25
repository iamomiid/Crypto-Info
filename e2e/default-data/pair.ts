import { Pair, PairId } from '@core/models/pair';
import { PairEntity } from '@db/entities/pair.entity';

export const pairEntityDefault: Partial<PairEntity> = {
  id: 1,
  symbol: 'ETCUSDT',
};

export const pairDefault: Pair = { id: 1 as PairId, symbol: 'ETCUSDT' };
