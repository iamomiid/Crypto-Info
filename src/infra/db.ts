import {
  Errors,
  DecodeErrors,
  DecodeTypeError,
  TypeError,
  wrapDecode,
  DatabaseError,
} from '@core/errors';
import { flow, Lazy, pipe } from 'fp-ts/lib/function';
import { optionFromNullable } from 'io-ts-types';
import * as O from 'fp-ts/lib/Option';
import * as E from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import * as TE from 'fp-ts/lib/TaskEither';
import * as RTE from 'fp-ts/lib/ReaderTaskEither';
import { getConnection, QueryRunner } from 'typeorm';
import { Dependencies } from '@core/dependencies';
import { providePartial, widen } from '@infra/reader';
import { repos } from '@db/repositories';

export type FindAndCount<A> = [Array<A>, number];

type TypeOfProps<P extends t.Props> = t.TypeOf<t.TypeC<P>>;
type OutputOfIntersection<
  CS extends [t.Mixed, t.Mixed, ...Array<t.Mixed>]
> = t.OutputOf<t.IntersectionC<CS>>;
type TypeOfIntersection<
  CS extends [t.Mixed, t.Mixed, ...Array<t.Mixed>]
> = t.TypeOf<t.IntersectionC<CS>>;

export const fromDB = <A extends ReadonlyArray<unknown>, B>(
  f: (...a: A) => Promise<B>,
) => TE.tryCatchK(f, (error) => Errors.as.DatabaseError({ error }));

export function save<
  CS extends [t.Mixed, t.Mixed, ...Array<t.Mixed>],
  A extends ReadonlyArray<unknown>
>(
  f: (...a: A) => Promise<OutputOfIntersection<CS>>,
  codec: t.IntersectionC<CS>,
): (...a: A) => TE.TaskEither<TypeError, TypeOfIntersection<CS>>;
export function save<
  CS extends [t.Mixed, t.Mixed, ...Array<t.Mixed>],
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<OutputOfIntersection<CS>>,
  codec: t.IntersectionC<CS>,
  errorHandler: DecodeTypeError<R>,
): (...a: A) => TE.TaskEither<R, TypeOfIntersection<CS>>;
export function save<P extends t.Props, A extends ReadonlyArray<unknown>>(
  f: (...a: A) => Promise<t.OutputOfProps<P>>,
  codec: t.TypeC<P>,
): (...a: A) => TE.TaskEither<TypeError, TypeOfProps<P>>;
export function save<
  P extends t.Props,
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<t.OutputOfProps<P>>,
  codec: t.TypeC<P>,
  errorHandler: DecodeTypeError<R>,
): (...a: A) => TE.TaskEither<R, TypeOfProps<P>>;
export function save<T, O, A extends ReadonlyArray<unknown>>(
  f: (...a: A) => Promise<Record<keyof O, unknown>>,
  codec: t.Type<T, O, unknown>,
): (...a: A) => TE.TaskEither<TypeError, T>;
export function save<
  T,
  O,
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<Record<keyof O, unknown>>,
  codec: t.Type<T, O, unknown>,
  errorHandler: DecodeTypeError<R>,
): (...a: A) => TE.TaskEither<R, T>;
export function save<
  T,
  O,
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<Record<keyof O, unknown>>,
  codec: t.Type<T, O, unknown>,
  errorHandler?: DecodeTypeError<R>,
) {
  return flow(fromDB(f), TE.chainEitherKW(wrapDecode(codec, errorHandler)));
}

export function findOne<
  CS extends [t.Mixed, t.Mixed, ...Array<t.Mixed>],
  A extends ReadonlyArray<unknown>
>(
  f: (
    ...a: A
  ) => Promise<Record<keyof OutputOfIntersection<CS>, unknown> | undefined>,
  codec: t.IntersectionC<CS>,
): (...a: A) => TE.TaskEither<TypeError, O.Option<TypeOfIntersection<CS>>>;
export function findOne<
  CS extends [t.Mixed, t.Mixed, ...Array<t.Mixed>],
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (
    ...a: A
  ) => Promise<Record<keyof OutputOfIntersection<CS>, unknown> | undefined>,
  codec: t.IntersectionC<CS>,
  errorHandler: DecodeTypeError<R>,
): (...a: A) => TE.TaskEither<R, O.Option<TypeOfIntersection<CS>>>;
export function findOne<P extends t.Props, A extends ReadonlyArray<unknown>>(
  f: (...a: A) => Promise<t.OutputOfProps<P> | undefined>,
  codec: t.TypeC<P>,
): (...a: A) => TE.TaskEither<TypeError, O.Option<TypeOfProps<P>>>;
export function findOne<
  P extends t.Props,
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<t.OutputOfProps<P> | undefined>,
  codec: t.TypeC<P>,
  errorHandler: DecodeTypeError<R>,
): (...a: A) => TE.TaskEither<R, O.Option<TypeOfProps<P>>>;
export function findOne<T, O, A extends ReadonlyArray<unknown>>(
  f: (...a: A) => Promise<Record<keyof O, unknown> | undefined>,
  codec: t.Type<T, O, unknown>,
): (...a: A) => TE.TaskEither<TypeError, O.Option<T>>;
export function findOne<
  T,
  O,
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<Record<keyof O, unknown> | undefined>,
  codec: t.Type<T, O, unknown>,
  errorHandler: DecodeTypeError<R>,
): (...a: A) => TE.TaskEither<R, O.Option<T>>;
export function findOne<
  T,
  O,
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<Record<keyof O, unknown> | undefined>,
  codec: t.Type<T, O, unknown>,
  errorHandler?: DecodeTypeError<R>,
) {
  return flow(
    fromDB(f),
    TE.chainEitherKW(wrapDecode(optionFromNullable(codec), errorHandler)),
  );
}

export function find<
  CS extends [t.Mixed, t.Mixed, ...Array<t.Mixed>],
  A extends ReadonlyArray<unknown>
>(
  f: (...a: A) => Promise<Record<keyof OutputOfIntersection<CS>, unknown>[]>,
  codec: t.IntersectionC<CS>,
): (...a: A) => TE.TaskEither<TypeError, TypeOfIntersection<CS>[]>;
export function find<
  CS extends [t.Mixed, t.Mixed, ...Array<t.Mixed>],
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<Record<keyof OutputOfIntersection<CS>, unknown>[]>,
  codec: t.IntersectionC<CS>,
  errorHandler: DecodeTypeError<R>,
): (...a: A) => TE.TaskEither<R, TypeOfIntersection<CS>[]>;
export function find<P extends t.Props, A extends ReadonlyArray<unknown>>(
  f: (...a: A) => Promise<t.OutputOf<t.TypeC<P>>[]>,
  codec: t.TypeC<P>,
): (...a: A) => TE.TaskEither<TypeError, TypeOfProps<P>[]>;
export function find<
  P extends t.Props,
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<t.OutputOfProps<P>[]>,
  codec: t.TypeC<P>,
  errorHandler: DecodeTypeError<R>,
): (...a: A) => TE.TaskEither<R, TypeOfProps<P>[]>;
export function find<T, O, A extends ReadonlyArray<unknown>>(
  f: (...a: A) => Promise<Record<keyof O, unknown>[]>,
  codec: t.Type<T, O, unknown>,
): (...a: A) => TE.TaskEither<TypeError, T[]>;
export function find<
  T,
  O,
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<Record<keyof O, unknown>[]>,
  codec: t.Type<T, O, unknown>,
  errorHandler: DecodeTypeError<R>,
): (...a: A) => TE.TaskEither<R, T[]>;
export function find<
  T,
  O,
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<Record<keyof O, unknown>[]>,
  codec: t.Type<T, O, unknown>,
  errorHandler?: DecodeTypeError<R>,
) {
  return flow(
    fromDB(f),
    TE.chainEitherKW(wrapDecode(t.array(codec), errorHandler)),
  );
}

export function findAndCount<
  CS extends [t.Mixed, t.Mixed, ...Array<t.Mixed>],
  A extends ReadonlyArray<unknown>
>(
  f: (
    ...a: A
  ) => Promise<FindAndCount<Record<keyof OutputOfIntersection<CS>, unknown>>>,
  codec: t.IntersectionC<CS>,
): (...a: A) => TE.TaskEither<TypeError, FindAndCount<TypeOfIntersection<CS>>>;

export function findAndCount<
  P extends t.Props,
  A extends ReadonlyArray<unknown>
>(
  f: (...a: A) => Promise<FindAndCount<t.OutputOfProps<P>>>,
  codec: t.TypeC<P>,
): (...a: A) => TE.TaskEither<TypeError, FindAndCount<TypeOfProps<P>>>;
export function findAndCount<
  P extends t.Props,
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<FindAndCount<t.OutputOfProps<P>>>,
  codec: t.TypeC<P>,
  errorHandler: DecodeTypeError<R>,
): (...a: A) => TE.TaskEither<R, FindAndCount<TypeOfProps<P>>>;
export function findAndCount<T, O, A extends ReadonlyArray<unknown>>(
  f: (...a: A) => Promise<FindAndCount<Record<keyof O, unknown>>>,
  codec: t.Type<T, O, unknown>,
): (...a: A) => TE.TaskEither<TypeError, FindAndCount<T>>;
export function findAndCount<
  T,
  O,
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<FindAndCount<Record<keyof O, unknown>>>,
  codec: t.Type<T, O, unknown>,
  errorHandler: DecodeTypeError<R>,
): (...a: A) => TE.TaskEither<R, FindAndCount<T>>;
export function findAndCount<
  T,
  O,
  A extends ReadonlyArray<unknown>,
  R extends DecodeErrors
>(
  f: (...a: A) => Promise<FindAndCount<Record<keyof O, unknown>>>,
  codec: t.Type<T, O, unknown>,
  errorHandler?: DecodeTypeError<R>,
) {
  return flow(
    fromDB(f),
    TE.chainEitherKW(([items, count]) =>
      pipe(
        wrapDecode(t.array(codec), errorHandler)(items),
        E.map((x) => [x, count]),
      ),
    ),
  );
}

const beginTransaction = fromDB(async () => {
  const connection = getConnection();
  const queryRunner = connection.createQueryRunner();
  await queryRunner.startTransaction();
  return queryRunner;
});

const commitTransaction = fromDB((qr: QueryRunner) => qr.commitTransaction());

const rollbackTransaction = fromDB((qr: QueryRunner) =>
  qr.rollbackTransaction(),
);
const releaseQueryRunner = fromDB((qr: QueryRunner) => qr.release());

export const withTransaction = <A>(
  f: (qr: QueryRunner) => TE.TaskEither<Errors, A>,
) =>
  TE.bracket(beginTransaction(), f, (qr, e) =>
    pipe(
      e,
      E.fold(
        () => rollbackTransaction(qr),
        () => commitTransaction(qr),
      ),
      TE.apFirst(releaseQueryRunner(qr)),
    ),
  );

export const withTransactionRTE = <E, A>(
  f: Lazy<RTE.ReaderTaskEither<Dependencies, E | DatabaseError, A>>,
) =>
  RTE.bracket(
    beginTransactionRTE(),
    (qr) => pipe(f(), providePartial(repos(qr.manager))),
    (qr, e) =>
      pipe(
        e,
        E.fold(
          () => rollbackTransactionRTE(qr),
          () => commitTransactionRTE(qr),
        ),
        widen,
        RTE.apFirst(releaseQueryRunnerRTE(qr)),
      ),
  );

const beginTransactionRTE = RTE.fromTaskEitherK(
  fromDB(async () => {
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    await queryRunner.startTransaction();
    return queryRunner;
  }),
);

const commitTransactionRTE = RTE.fromTaskEitherK(
  fromDB((qr: QueryRunner) => qr.commitTransaction()),
);

const rollbackTransactionRTE = RTE.fromTaskEitherK(
  fromDB((qr: QueryRunner) => qr.rollbackTransaction()),
);

const releaseQueryRunnerRTE = RTE.fromTaskEitherK(
  fromDB((qr: QueryRunner) => qr.release()),
);
