import { IPairRepository } from '@core/interfaces/pair.repository';

export interface Dependencies extends Repositories {}

export interface Repositories {
  PairRepository: IPairRepository;
}
