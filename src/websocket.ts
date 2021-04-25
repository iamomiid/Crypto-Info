import { PairRepository } from '@core/interfaces/pair.repository';
import { E, RTE, t } from '@core/prelude';
import { mkPairRepo } from '@db/repositories/pair.repository';
import { pipe } from 'fp-ts/lib/function';
import { EntityManager, getConnection } from 'typeorm';
import binance from 'binance-api-node';
import { Dependencies } from '@core/dependencies';
import { repos } from '@db/repositories';
import { CandleInterval } from '@core/models/candle';
import { handleCandle } from '@core/websocket/candle';

const client = binance();

const mkDependencies = (em: EntityManager): Dependencies => ({ ...repos(em) });

const runRTE = (em: EntityManager) => <I extends t.Mixed, E, A>(
  input: (a: I) => RTE.ReaderTaskEither<Dependencies, E, A>,
) => (a: t.OutputOf<I>) => input(a)(mkDependencies(em))();

export async function runWebsocket() {
  await candle();
}

async function candle() {
  const connection = getConnection();
  const em = connection.createEntityManager();

  const pairs = await PairRepository.findAll()(mkDependencies(em))();
  const runner = runRTE(em);

  pipe(
    pairs,
    E.fold(
      () => {
        console.error();
      },
      (data) => {
        for (const pair of data) {
          for (const period of Object.keys(CandleInterval.keys)) {
            client.ws.candles(pair.symbol, period, runner(handleCandle));
          }
        }
      },
    ),
  );
}
