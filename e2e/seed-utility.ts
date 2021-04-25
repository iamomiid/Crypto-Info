import { A } from '@core/prelude';
import * as R from 'fp-ts/Record';
import { DeepPartial, EntityManager } from 'typeorm';
import { pipe } from 'fp-ts/lib/function';
import { PairEntity } from '@db/entities/pair.entity';
import { CandleEntity } from '@db/entities/candle.entity';

const EntityDictionary = {
  Pair: PairEntity,
  Candle: CandleEntity,
};

type InsertSeedData = {
  [I in keyof typeof EntityDictionary]: Array<
    DeepPartial<typeof EntityDictionary[I]['prototype']>
  >;
};

export type SeedData = Partial<InsertSeedData>;

export const seed = async (entityManager: EntityManager, data: SeedData) => {
  await entityManager.transaction(async (em) => {
    await em.query('SET FOREIGN_KEY_CHECKS = 0;');

    await pipe(
      data as InsertSeedData,
      R.keys,
      A.map((key) => {
        return EntityDictionary[key]
          ? em.delete(EntityDictionary[key], {}).then(() =>
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              data[key]!.length > 0
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  em.save(EntityDictionary[key], data[key] as any)
                : Promise.resolve(),
            )
          : Promise.reject();
      }),
      (x) => Promise.all(x),
    );

    await em.query('SET FOREIGN_KEY_CHECKS = 1;');
  });
};
export const seedFn = async (
  entityManager: EntityManager,
  cb: (em: EntityManager) => Promise<void>,
) => {
  return entityManager.transaction(async (em) => {
    await em.query('SET FOREIGN_KEY_CHECKS = 0;');
    await cb(em);
    await em.query('SET FOREIGN_KEY_CHECKS = 1;');
  });
};
