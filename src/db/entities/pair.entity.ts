import { Base } from '@db/entities/base';
import { Column, Entity } from 'typeorm';

@Entity('pair')
export class PairEntity extends Base {
  @Column({ unique: true })
  symbol!: string;
}
