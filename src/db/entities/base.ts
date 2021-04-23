import {
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class Base extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ precision: 6, onUpdate: 'CURRENT_TIMESTAMP(6)' })
  updatedAt!: Date;
}
