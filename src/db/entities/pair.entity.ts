import { Base } from './base';
import { CandleEntity } from './candle.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('pair')
export class PairEntity extends Base {
  @Column({ unique: true })
  symbol!: string;

  @OneToMany(() => CandleEntity, (candle) => candle.pair)
  candles!: CandleEntity[];
}
