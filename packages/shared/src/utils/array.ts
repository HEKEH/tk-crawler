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

export function getMaxArrayValueIndex<T>(
  array: T[],
  valueFn: (item: T) => number,
): number {
  if (array.length === 0) {
    return -1;
  }
  let maxIndex = 0;
  let maxValue = valueFn(array[0]);
  for (let i = 1; i < array.length; i++) {
    const value = valueFn(array[i]);
    if (value > maxValue) {
      maxValue = value;
      maxIndex = i;
    }
  }
  return maxIndex;
}

export function getMinArrayValueIndex<T>(
  array: T[],
  valueFn: (item: T) => number,
): number {
  if (array.length === 0) {
    return -1;
  }
  let minIndex = 0;
  let minValue = valueFn(array[0]);
  for (let i = 1; i < array.length; i++) {
    const value = valueFn(array[i]);
    if (value < minValue) {
      minValue = value;
      minIndex = i;
    }
  }
  return minIndex;
}
