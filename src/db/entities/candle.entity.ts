import { Base } from './base';
import { PairEntity } from './pair.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { CandleInterval } from '@core/models/candle';

@Entity('candle')
@Unique('pair-candle', ['pairId', 'interval', 'start', 'end'])
export class CandleEntity extends Base {
  @Column({ type: 'bigint' })
  high!: number;

  @Column({ type: 'bigint' })
  low!: number;

  @Column({ type: 'bigint' })
  open!: number;

  @Column({ type: 'bigint' })
  close!: number;

  @Column({ type: 'timestamp', precision: 6 })
  start!: Date;

  @Column({ type: 'timestamp', precision: 6 })
  end!: Date;

  @Column({ type: 'bool' })
  final!: boolean;

  @Column({ type: 'enum', enum: Object.keys(CandleInterval.keys) })
  interval!: CandleInterval;

  @Column()
  pairId!: number;

  @ManyToOne(() => PairEntity)
  @JoinColumn()
  pair!: PairEntity;
}
