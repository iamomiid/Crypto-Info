import { criticalError } from '@core/errors';
import { env } from 'process';
import { A, O, RTE, TE } from '@core/prelude';
import { pipe } from 'fp-ts/lib/function';
import fs from 'fs';
import { PairRepository } from '@core/interfaces/db/pair.repository';

const readFile = TE.tryCatchK(
  () =>
    new Promise<string[]>((resolve, reject) => {
      const filePath = env.PAIR_CSV_FILE;

      if (!filePath) {
        return resolve([]);
      }

      fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
        if (err) {
          return reject(err);
        }

        return data.split(',');
      });
    }),
  (r) =>
    criticalError({ error: r as Error, message: 'Failed to read pair file' }),
);

const checkIfSymbolExists = (symbol: string) =>
  pipe(
    PairRepository.findOne(symbol),
    RTE.map((pair) => (O.isSome(pair) ? O.none : O.some(symbol))),
  );

export const seedPair = () =>
  pipe(
    readFile(),
    RTE.fromTaskEither,
    RTE.chainW(A.traverse(RTE.Monad)(checkIfSymbolExists)),
    RTE.map(A.compact),
    RTE.chainW(A.traverse(RTE.Monad)(PairRepository.save)),
  );
