export function getRandomNumber(
  min: number,
  max: number,
  forceNotZero?: boolean,
): number {
  // Force number to not be 0
  if (forceNotZero) {
    const number = Math.random() * (max - min) + min;
    return number === 0 ? getRandomNumber(min, max, forceNotZero) : number;
  } else {
    return Math.random() * (max - min) + min;
  }
}

export function getRandomRotation(min = -10, max = 10, forceNotZero?: boolean) {
  return `${getRandomNumber(min, max, forceNotZero)}deg`;
}

export function getRandomOffset(min = -5, max = 5) {
  return getRandomNumber(min, max);
}

export function getRandomInArray<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Partition an array into two arrays based on a predicate
 * @param array - The array to partition
 * @param predicate - The predicate to use to partition the array
 * @returns An array of two arrays
 */
export function partition<T>(array: T[], predicate: (item: T) => boolean) {
  return array.reduce<[T[], T[]]>(
    (acc, item) => {
      const key = predicate(item) ? 0 : 1;
      acc[key].push(item);
      return acc;
    },
    [[], []],
  );
}

/**
 * Chunk an array into smaller arrays of a given size
 * @param array - The array to chunk
 * @param size - The size of the chunks
 * @returns An array of arrays
 */
export function chunk<T>(array: T[], size: number) {
  return array.reduce<T[][]>(
    (acc, _, i) => (i % size ? acc : [...acc, array.slice(i, i + size)]),
    [],
  );
}
