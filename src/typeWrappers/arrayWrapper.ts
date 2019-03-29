export type OneOrArray<T> = T | T[];

/**
 * If type of value is T - return array of T.
 * Otherwise return passed array
 */
export function wrapInArray<T>(value: OneOrArray<T>): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * If type of value is T - return array of T.
 * Otherwise return passed array
 */
export function wrapInArrayFn<T>(): (value: OneOrArray<T>) => T[] {
  return wrapInArray;
}
