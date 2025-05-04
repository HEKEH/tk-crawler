/** 做一个简单的处理，但是这个代码会混淆，难以阅读 */
export function secureObject<T extends Record<string, any>>(
  object: T,
  keys: (keyof T)[],
  values: T[keyof T][],
) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = values[i];
    object[key] = value;
  }
  return object;
}
