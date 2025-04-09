export function beautifyJsonStringify<T>(json: T): string {
  return JSON.stringify(json, null, 2);
}
