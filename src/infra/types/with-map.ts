/* eslint-disable @typescript-eslint/no-explicit-any */
import * as t from 'io-ts';
import { pipe } from 'fp-ts/lib/function';
import { withEncode, withValidate } from 'io-ts-types';

import * as E from 'fp-ts/Either';

export const withMap = <C extends t.Mixed, A>(
  codec: C,
  from: (a: A) => t.OutputOf<C>,
  to: (a: t.OutputOf<C>) => A,
): t.Type<t.TypeOf<C>, A, unknown> => {
  const type = withValidate(
    withEncode(codec, (a) => pipe(codec.encode(a), to)),
    (u, c) =>
      pipe(
        E.tryCatch(
          () => from(u as any),
          (error) => {
            return [
              { value: String(error).concat(JSON.stringify(u)), context: c },
            ];
          },
        ),
        E.chain((x) => codec.validate(x, c)),
      ),
  );
  return type;
};
