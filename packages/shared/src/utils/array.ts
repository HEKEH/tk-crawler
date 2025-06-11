export function isArrayEqual(
  a: unknown[],
  b: unknown[],
  compareFn: (a: unknown, b: unknown) => boolean = (a, b) => a === b,
  needSort: boolean = false,
): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let a_copy = a;
  let b_copy = b;
  if (needSort) {
    a_copy = [...a].sort();
    b_copy = [...b].sort();
  }
  return a_copy.every((item, index) => {
    return compareFn(item, b_copy[index]);
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
