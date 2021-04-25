import { IPairRepository } from '@core/interfaces/db/pair.repository';
import { mkPairRepo } from '@db/repositories/pair.repository';
import { EntityManager, getConnection } from 'typeorm';
import chai, { expect } from 'chai';
import subset from 'chai-subset';
import { seed, seedFn } from '../seed-utility';
import { PairEntity } from '@db/entities/pair.entity';
import { pairDefault, pairEntityDefault } from '../default-data/pair';
import { runE2E } from '../utility';
import { O } from '@core/prelude';
chai.use(subset);

describe('Pair Repository', () => {
  let entityManager: EntityManager;
  let pairRepository: IPairRepository;

  before(async () => {
    const connection = getConnection();
    entityManager = connection.createEntityManager();
    pairRepository = mkPairRepo(entityManager);
    await seedFn(entityManager, async (em) => {
      await em.getRepository(PairEntity).delete({});
    });
  });

  after(async () => {
    await seedFn(entityManager, async (em) => {
      await em.getRepository(PairEntity).delete({});
    });
  });

  it('should save new pair', async () => {
    const output = await runE2E(pairRepository.save(pairDefault.symbol));

    const [entity, count] = await entityManager
      .getRepository(PairEntity)
      .findAndCount();

    expect(count).to.be.equal(1);

    expect(entity[0].symbol).to.be.equal(pairDefault.symbol);
  });

  it('should find one pair', async () => {
    await seed(entityManager, { Pair: [pairEntityDefault] });

    const output = await runE2E(
      pairRepository.findOne(pairEntityDefault.symbol!),
    );

    expect(output).to.containSubset(O.some(pairDefault));
  });

  it('should find all pairs', async () => {
    await seed(entityManager, {
      Pair: [pairEntityDefault, { id: 2, symbol: 'BTCUSDT' }],
    });

    const output = await runE2E(pairRepository.findAll());

    expect(output).to.containSubset([
      pairDefault,
      { id: 2, symbol: 'BTCUSDT' },
    ]);
  });
});
