export function isArrayEqual(
  a: unknown[],
  b: unknown[],
  compareFn: (a: unknown, b: unknown) => boolean = (a, b) => a === b,
): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((item, index) => {
    return compareFn(item, b[index]);
  });
}
