export function getRandomArrayElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomShortString(length: number): string {
  if (length <= 11) {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length);
  }
  throw new Error('length must be less than or equal to 11');
}

/** 根据权重随机获取数组元素 */
export function getRandomArrayElementWithWeight<T>(
  array: readonly [T, number][],
): T {
  const totalWeight = array.reduce((sum, [_, weight]) => sum + weight, 0);
  const randomValue = Math.random() * totalWeight;
  let cumulativeWeight = 0;
  for (const [element, weight] of array) {
    cumulativeWeight += weight;
    if (randomValue < cumulativeWeight) {
      return element;
    }
  }
  return array[array.length - 1][0];
}
