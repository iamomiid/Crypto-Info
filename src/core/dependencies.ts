import { ICandleRepository } from '@core/interfaces/db/candle.repository';
import { IPairRepository } from '@core/interfaces/db/pair.repository';
import { IBinanceService } from '@core/interfaces/external/binance.service';

export interface Dependencies extends Repositories {
  BinanceService: IBinanceService;
}

export interface Repositories {
  PairRepository: IPairRepository;
  CandleRepository: ICandleRepository;
}
