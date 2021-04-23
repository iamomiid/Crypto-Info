import * as E from 'fp-ts/Either';
export * from 'fp-ts/Either';
export const foldW: <A, B, C, L>(
  onLeft: (a: L) => C,
  onRight: (a: A) => B,
) => (ma: E.Either<L, A>) => B | C = (onLeft, onRight) => (ma) =>
  E.isLeft(ma) ? onLeft(ma.left) : onRight(ma.right);
