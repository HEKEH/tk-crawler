export function isEmpty(obj: object | null | undefined): boolean {
  return obj === null || obj === undefined || Object.keys(obj).length === 0;
}
