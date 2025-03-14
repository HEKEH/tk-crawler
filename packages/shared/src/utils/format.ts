export function transObjectValuesToString<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> & {
  [P in K]: undefined extends T[P] ? string | undefined : string;
} {
  const newObj = { ...obj } as any;
  for (const key of keys) {
    newObj[key] = newObj[key] ? newObj[key].toString() : undefined;
  }
  return newObj;
}

export function transObjectValuesToBigInt<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> & {
  [P in K]: undefined extends T[P] ? bigint | undefined : bigint;
} {
  const newObj = { ...obj } as any;
  for (const key of keys) {
    newObj[key] = newObj[key] ? BigInt(newObj[key] as string) : undefined;
  }
  return newObj;
}
