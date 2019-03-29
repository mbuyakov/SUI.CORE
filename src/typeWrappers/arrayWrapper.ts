/**
 * If type of value is T - return array of T.
 * Otherwise return passed array
 */
export function wrapInArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

/**
 * If type of value is T - return array of T.
 * Otherwise return passed array
 */
export function wrapInArrayFn<T>(): (value: T | T[]) => T[] {
  return wrapInArray;
}
