import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
export * from 'fp-ts/Option';

export const foldW: <A, B, C>(
  onNone: () => C,
  onSome: (a: A) => B,
) => (ma: O.Option<A>) => B | C = (onNone, onSome) => (ma) =>
  O.isNone(ma) ? onNone() : onSome(ma.value);
