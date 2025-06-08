import { toRaw } from 'vue';

export function deepToRaw<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  const raw = toRaw(value);

  if (Array.isArray(raw)) {
    return raw.map(item => deepToRaw(item)) as T;
  }

  if (raw instanceof Map) {
    return new Map(
      Array.from(raw.entries()).map(([k, v]) => [k, deepToRaw(v)]),
    ) as T;
  }

  if (raw instanceof Set) {
    return new Set(Array.from(raw).map(item => deepToRaw(item))) as T;
  }

  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, deepToRaw(v)]),
  ) as T;
}
