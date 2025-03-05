export function transObjectIdToString<T extends object, K extends keyof T>(
  obj: T,
  idKey: K,
): Omit<T, K> & {
  [P in K]: undefined extends T[P] ? string | undefined : string;
} {
  if (obj[idKey] === null || obj[idKey] === undefined) {
    return obj as any;
  }
  return {
    ...obj,
    [idKey]: obj[idKey].toString(),
  };
}

export function transObjectIdToBigInt<T extends object, K extends keyof T>(
  obj: T,
  idKey: K,
): Omit<T, K> & {
  [P in K]: undefined extends T[P] ? bigint | undefined : bigint;
} {
  if (!obj[idKey]) {
    return obj as any;
  }
  return {
    ...obj,
    [idKey]: BigInt(obj[idKey] as string),
  };
}
