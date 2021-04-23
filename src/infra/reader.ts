import { pipe } from 'fp-ts/lib/function';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import * as TE from 'fp-ts/lib/TaskEither';
import { Dependencies } from '@core/dependencies';

// -------------------------------------------------------------------------------------
// Trace
// -------------------------------------------------------------------------------------
export const trace = (name: string) => <R, E, A>(
  rte: RTE.ReaderTaskEither<R, E, A>,
) =>
  pipe(
    rte,
    RTE.map((x) => (console.log(name, JSON.stringify(x, null, 2)), x)),
  );

// -------------------------------------------------------------------------------------
// Read & Ask Functions
// -------------------------------------------------------------------------------------

export type DependencyKey = keyof Dependencies;

export type Need<A extends DependencyKey> = {
  [key in A]: Dependencies[A];
};

export type NestedNeed<
  A extends DependencyKey,
  B extends keyof Dependencies[A]
> = {
  [key in A]: Pick<Dependencies[A], B>;
};

/**
 * provided key of dependencies it will return the dependency inside a `ReaderTaskEither`
 * @param k key of dependency
 */
export const read = <A extends DependencyKey>(k: A) =>
  RTE.asks((r: Need<A>) => r[k]);

/**
 *
 * @param k key of dependency
 * @param k2 key of function inside the key
 */
export const readNested = <
  A extends DependencyKey,
  B extends keyof Dependencies[A]
>(
  k: A,
  k2: B,
) =>
  pipe(
    RTE.ask<NestedNeed<A, B>>(),
    RTE.map((x) => x[k][k2]),
  );

// -------------------------------------------------------------------------------------
// types for Extracting R & E & A
// -------------------------------------------------------------------------------------

export type ExtractR<T> = T extends RTE.ReaderTaskEither<infer R, any, any>
  ? R
  : never;
export type ExtractA<T> = T extends RTE.ReaderTaskEither<any, any, infer A>
  ? A
  : never;
export type ExtractE<T> = T extends RTE.ReaderTaskEither<any, infer E, any>
  ? E
  : never;

// -------------------------------------------------------------------------------------
// Partially Provider
// -------------------------------------------------------------------------------------

/**
 * sometimes we want to provide some resource before the whole Resource
 *
 * @param r Partial Resource that needs to be injected
 */
export const providePartial: <R>(
  r: R,
) => <R2, E, A>(
  rte: RTE.ReaderTaskEither<R2 & R, E, A>,
) => RTE.ReaderTaskEither<R2, E, A> = (r) => (rte) => (r2) =>
  rte({ ...r2, ...r });

// -------------------------------------------------------------------------------------
// extract taskEitherK from Dependency
// -------------------------------------------------------------------------------------

type ExtractParamsTaskEitherK<
  A extends (...a: any) => TE.TaskEither<any, any>
> = A extends (...a: infer B) => TE.TaskEither<any, any> ? B : never;

type ExtractDataTaskEitherK<
  A extends (...a: any) => TE.TaskEither<any, any>
> = A extends (...a: any) => TE.TaskEither<any, infer B> ? B : never;

type ExtractErrorTaskEitherK<
  A extends (...a: any) => TE.TaskEither<any, any>
> = A extends (...a: any) => TE.TaskEither<infer B, any> ? B : never;

type TaskEitherKKeys<T> = {
  [K in keyof T]: T[K] extends (...a: any) => TE.TaskEither<any, any>
    ? K
    : never;
}[keyof T];

/**
 * it will ask a taskEitherK from `Dependencies[k][kk]` and return a RTE.ReaderTaskEitherK
 *
 * @param k key of the dependency
 * @param kk key of inside dependency that is taskEitherK
 */
const extractTaskEitherK: <
  K extends DependencyKey,
  KK extends TaskEitherKKeys<Dependencies[K]>,
  T extends Dependencies[K][KK]
>(
  k: K,
  kk: KK,
) => (
  ...a: [...ExtractParamsTaskEitherK<T>]
) => RTE.ReaderTaskEither<
  NestedNeed<K, KK>,
  ExtractErrorTaskEitherK<T>,
  ExtractDataTaskEitherK<T>
> = (k, kk) => (...input) =>
  pipe(
    readNested(k, kk) as (...a: any) => TE.TaskEither<any, any>,
    RTE.chainTaskEitherK((x) => x(...input)),
  );

export type ServiceOrRepo<A extends DependencyKey> = {
  [K in keyof Dependencies[A]]: Dependencies[A][K] extends (
    ...a: any
  ) => TE.TaskEither<any, any>
    ? (
        ...a: ExtractParamsTaskEitherK<Dependencies[A][K]>
      ) => RTE.ReaderTaskEither<
        NestedNeed<A, K>,
        ExtractErrorTaskEitherK<Dependencies[A][K]>,
        ExtractDataTaskEitherK<Dependencies[A][K]>
      >
    : never;
};

const getKeys = <A extends Record<any, any>>(record: A): (keyof A)[] =>
  Object.keys(record);

export const extractServiceOrRepo = <K extends DependencyKey>(
  k: K,
  record: Record<TaskEitherKKeys<Dependencies[K]>, null>,
): ServiceOrRepo<K> =>
  getKeys(record).reduce(
    (prev, curr) => ({ ...prev, [curr]: extractTaskEitherK(k, curr) }),
    {} as ServiceOrRepo<K>,
  );

// -------------------------------------------------------------------------------------
// Utility
// -------------------------------------------------------------------------------------

/**
 * this function is like `RTE.of` and `RTE.right` but the type is better
 * error is never and in our case cause our Resource is record of dependencies the record is empty
 *
 * @param x the input that we want to lift to RTE.ReaderTaskEither
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const pure = <A>(x: A) => RTE.of<{}, never, A>(x);

/**
 * this function get a union of two RTE.ReaderTaskEither `ReaderTaskEither<R, E, A> | RTE.ReaderTaskEither<Q, D,A>` and returns
 * `ReaderTaskEither<R & Q, E | D, A>`
 *
 *  **NOTE: if your Resource Type or Error Type is unknown this function does not work correctly**
 *  use `RTE.pure` to create correct type
 *
 * @param x is a union type of two RTE.ReaderTaskEither
 */
export const widen = <T extends RTE.ReaderTaskEither<any, any, any>>(
  x: T,
): RTE.ReaderTaskEither<
  UnionToIntersection<
    T extends RTE.ReaderTaskEither<infer R, any, any> ? R : never
  >,
  T extends RTE.ReaderTaskEither<any, infer E, any> ? E : never,
  T extends RTE.ReaderTaskEither<any, any, infer A> ? A : never
> => x;

// -------------------------------------------------------------------------------------
// Traversing And Sequencing
// -------------------------------------------------------------------------------------

// see https://github.com/gcanti/fp-ts/issues/904#issuecomment-619580507
// this here will merge the reader dependencies and widen the error type of RTE.ReaderTaskEither
// this intersection type will merge union type A | B | C to A & B & C
// { [I in keyof T]: T } this will create a tuple (a:A, b:B) => [A, B]
// { [I in keyof T]: T }[number] this will generate a union type A | B | C
// so Intersection<{[I in keyof T]: T}[number]> will create A & B & C
// our dependencies is the intersection between the tuples
// our error is union type between tuples
// our result is the tuple we want
type UnionToIntersection<A> = (A extends any ? (a: A) => void : never) extends (
  a: infer A,
) => void
  ? A
  : never;
