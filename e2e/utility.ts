import { E, TE } from '@core/prelude';

export const runE2E = <E, A>(te: TE.TaskEither<E, A>) =>
  te().then(
    E.fold(
      (e) => {
        throw e;
      },
      (v) => v,
    ),
  );
