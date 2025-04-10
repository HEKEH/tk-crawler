import type { ComputedRef, MaybeRef } from 'vue';

export type UseQueryParams<T extends object> = {
  [K in keyof T]: T[K] extends MaybeRef<T>
    ? T[K]
    : T[K] extends ComputedRef
      ? T[K]
      : T[K] | MaybeRef<T[K]> | ComputedRef<T[K]>;
};
