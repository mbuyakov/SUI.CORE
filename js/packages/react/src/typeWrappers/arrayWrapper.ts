export type OneOrArray<T> = T | T[];

export type OneOrArrayWithNulls<T> = T | Array<T | null | undefined | false>;

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

/**
 * If type of value is T - return array of T.
 * Otherwise return passed array
 */
export function wrapInArrayWithoutNulls<T>(value: OneOrArrayWithNulls<T>): T[] {
  return Array.isArray(value) ? value.filter(item => item) as T[] : [value];
}

/**
 * If type of value is T - return array of T.
 * Otherwise return passed array
 */
export function wrapInArrayWithoutNullsFn<T>(): (value: OneOrArrayWithNulls<T>) => T[] {
  return wrapInArrayWithoutNulls;
}
