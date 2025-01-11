export function getRandomArrayElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
