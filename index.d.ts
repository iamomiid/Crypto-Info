/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

export type UnionToIntersection<A> = (
  A extends any ? (a: A) => void : never
) extends (a: infer A) => void
  ? A
  : never;

export type OmitD<T, K extends keyof T> = T extends any ? Omit<T, K> : never;

export type TaggedUnionToIntersection<T> = UnionToIntersection<
  Partial<OmitD<T, keyof T>> & Pick<T, keyof T>
>;

declare global {
  export namespace Express {
    export interface Request {}
  }
}
