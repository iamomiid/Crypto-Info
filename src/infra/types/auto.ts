import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as t from 'io-ts';

type AutoMode = 'insert' | 'update' | 'dto';

export type Auto<A, B extends AutoMode> = A & { AutoBrand: B };
class AutoType<A, O = A, I = unknown> extends t.Type<A, O, I> {
  _tag: 'AutoType' = 'AutoType';
}

/**
 * auto codec means that database will create this type so when we want to insert we don't need this
 *
 * @param codec a codec that we want to wrap inside auto
 */
export function auto<C extends t.Mixed, T extends AutoMode = 'insert'>(
  codec: C,
  mode?: T[],
): AutoType<Auto<t.TypeOf<C>, T>, t.OutputOf<C>, unknown> {
  const selectedMode = mode ?? (['insert'] as AutoMode[]);
  return new AutoType(
    `Auto<${codec.name}>`,
    codec.is,
    (u, c) => {
      const result = c.reduce(
        (prev, curr) => {
          const tag = (curr.type as any)._tag || curr.type.name;

          if (tag === 'AutoRemovalType') {
            const autoRemovalType = curr.type as AutoRemovalTypeC<
              any,
              any,
              any
            >;
            if (selectedMode.includes(autoRemovalType.mode)) {
              return {
                haveInsert: true,
                level: 0,
                insideType: false,
                nested: autoRemovalType.nested,
                tags: [tag],
              };
            }
          }
          if (
            prev.haveInsert &&
            ![
              'UnionType',
              'IntersectionType',
              'OmitType',
              'PickType',
              'AutoType',
            ].includes(tag)
          ) {
            return {
              ...prev,
              level: prev.level + 1,
              tags: [...prev.tags, tag],
            };
          }

          return prev;
        },
        {
          haveInsert: false,
          level: 0,
          nested: false,
          tags: [],
        } as {
          haveInsert: boolean;
          nested: boolean;
          level: number;
          tags: string[];
        },
      );

      if (result.haveInsert && (result.level === 1 || result.nested)) {
        return t.success(undefined);
      }
      return codec.validate(u, c);
    },
    (a) => (a ? codec.encode(a) : undefined),
  );
}

export type AutoKeys<P, F extends AutoMode> = {
  [K in keyof P]: P[K] extends Auto<infer D, infer M>
    ? F extends M
      ? K
      : never
    : never;
}[keyof P];

export type AutoRemoval<T, K extends AutoMode> = T extends any
  ? Omit<T, AutoKeys<T, K>>
  : never;

export type NestedAutoRemoval<T, K extends AutoMode> = T extends Record<
  string,
  unknown
>
  ? Omit<
      {
        [P in keyof T]: NestedAutoRemoval<T[P], K>;
      },
      AutoKeys<T, K>
    >
  : T;

export type NestedInsertType<T> = NestedAutoRemoval<T, 'insert'>;

export type InsertType<T> = AutoRemoval<T, 'insert'>;
export type UpdateType<T> = AutoRemoval<T, 'update'>;
export type DTOType<T> = AutoRemoval<T, 'dto'>;

class AutoRemovalTypeC<A, O = A, I = unknown> extends t.Type<A, O, I> {
  _tag: 'AutoRemovalType' = 'AutoRemovalType';
  constructor(
    /** a unique name for this codec */
    name: string,
    /** a custom type guard */
    is: t.Is<A>,
    /** succeeds if a value of type I can be decoded to a value of type A */
    validate: t.Validate<I, A>,
    /** converts a value of type A to a value of type O */
    encode: t.Encode<A, O>,
    readonly mode: AutoMode,
    readonly nested: boolean,
  ) {
    super(name, is, validate, encode);
  }
}

export function autoRemoval<C extends t.Mixed, M extends AutoMode>(
  codec: C,
  mode: M,
): t.Type<AutoRemoval<t.TypeOf<C>, M>, t.OutputOf<C>> {
  return new AutoRemovalTypeC(
    `AutoRemoval<${codec.name}>`,
    codec.is,
    (u, c) =>
      pipe(
        codec.validate(u, t.appendContext(c, 'Auto', codec, u)),
        E.map((x) => JSON.parse(JSON.stringify(x))),
      ),
    codec.encode,
    mode,
    false,
  );
}

export function nestedAutoRemoval<C extends t.Mixed, M extends AutoMode>(
  codec: C,
  mode: M,
): t.Type<NestedAutoRemoval<t.TypeOf<C>, M>, t.OutputOf<C>> {
  return new AutoRemovalTypeC(
    `NestedAutoRemoval<${codec.name}>`,
    codec.is,
    (u, c) =>
      pipe(
        codec.validate(u, t.appendContext(c, 'NestedAuto', codec, u)),
        E.map((x) => JSON.parse(JSON.stringify(x))),
      ),
    codec.encode,
    mode,
    true,
  );
}
/**
 *
 * this function will remove all `auto` codecs
 *
 * @param codec codec that have auto type
 */
export function insert<C extends t.Mixed>(codec: C) {
  return autoRemoval(codec, 'insert');
}

export function nestedInsert<C extends t.Mixed>(codec: C) {
  return nestedAutoRemoval(codec, 'insert');
}
