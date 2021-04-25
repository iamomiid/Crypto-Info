import { E } from '@core/prelude';
import { Type } from '@core/prelude/io-ts';

export function alt<A, IA, IB, O, OB>(
  a: Type<A, O, IA>,
  b: Type<A, OB, IB>,
  name = `alt(${a.name}, ${b.name})`,
): Type<A, O, IA | IB> {
  return new Type(
    name,
    a.is,
    (i, c) => E.alt(() => b.validate(i as IB, c))(a.validate(i as IA, c)),
    a.encode,
  );
}
