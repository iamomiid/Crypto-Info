import { Dependencies } from '@core/dependencies';
import { Errors } from '@core/errors';
import { A, E, RTE } from '@core/prelude';
import { seedPair } from '@core/seed/pair';
import { repos } from '@db/repositories';
import { EntityManager, getConnection } from 'typeorm';

type SeedFunction<A> = () => RTE.ReaderTaskEither<Dependencies, Errors, A>;

const seeds: SeedFunction<any>[] = [seedPair];

const mkDependencies = (em: EntityManager): Dependencies => ({ ...repos(em) });

export const runSeeds = async () => {
  const connection = getConnection();
  const em = connection.createEntityManager();

  const dependencies = mkDependencies(em);
  await Promise.all(seeds.map((x) => x()(dependencies)())).then(
    A.map(
      E.fold(
        (e) => {
          console.error('Seed Failed', e);
        },
        (d) => {
          console.info('Seed Successful');
        },
      ),
    ),
  );
};

