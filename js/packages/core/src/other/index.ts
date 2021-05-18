/* eslint-disable @typescript-eslint/no-explicit-any */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// eslint-disable-next-line @typescript-eslint/ban-types
export type NotFunction<T> = T extends Function ? never : T;

export type Nullable<T> = T | null | undefined;

export type Merge<T, K> = Pick<T, Exclude<keyof T, keyof K>> & K;

/**
 * Return promise, that resolve after given ms
 */
export async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export interface IObjectWithIndex {
  [index: string]: any;
}

/**
 * Async map
 */
export async function asyncMap<T, U>(array: T[], fn: (item: T, index: number, originalArray: T[]) => Promise<U>): Promise<U[]> {
  return Promise.all(array.map(fn));
}

/**
 * Async replace
 */
export async function asyncReplace(
  str: string,
  regExp: string | RegExp,
  replacer: (substring: string, ...args: any[]) => Promise<string>
): Promise<string> {
  const promises: Array<Promise<string>> = [];

  str.replace(regExp, (substring, ...args) => {
    promises.push(replacer(substring, ...args));

    return substring;
  });

  const replacements = await Promise.all(promises);

  return str.replace(regExp, () => replacements.shift());
}

export type Unpacked<T> =
  T extends Array<infer U> ? U :
    T extends (...args: any[]) => infer U ? U :
      T extends Promise<infer U> ? U :
        T;

/**
 * Array groupBy (stolen from lodash)
 */
export function groupBy<K, V, U = V[]>(
  array: V[],
  keyExtractor: (v: V) => K,
  combiner: (v: V, values: U | undefined) => U = (v, values): any => [...(values as any || []), v] as any
): Map<K, U> {
  const groups = new Map<K, U>();
  array.forEach((element) => {
    const key = keyExtractor(element);
    groups.set(key, combiner(element, groups.get(key)));
  });

  return groups;
}

/**
 * Array to map converter
 */
export function toMap<K, V, U = V>(
  array: V[],
  keyExtractor: (v: V) => K,
  valueExtractor: (v: V) => U = (v): U => v as any as U
): Map<K, U> {
  const result = new Map<K, U>();
  array.forEach(element => result.set(keyExtractor(element), valueExtractor(element)));

  return result;
}

/**
 * Extract Distinct values from array
 */
export function distinctValues<E, V = E>(params: {
  array: E[];
  includeNulls?: boolean;
  equals?(v1: V, v2: V): boolean;
  mapper?(element: E): V;
}): V[] {
  const equalsFn = params.equals || ((v1, v2): boolean => v1 === v2);

  return params.array
    .map(params.mapper || ((e): V => e as unknown as V))
    .filter(params.includeNulls ? (): boolean => true : Boolean)
    .filter((element, index, array) => index === array.findIndex(value => equalsFn(element, value)));
}

/**
 * Find element in array
 */
export function findByValue<T, V>(array: T[], valueExtractor: (element: T) => V, value: V): T | undefined {
  return array.find(element => valueExtractor(element) === value);
}

/**
 * Chain mapper
 */
export function chain<OUT, IN = OUT>(src: IN, firstMapper: (src: IN) => OUT, ...mappers: Array<(src: OUT) => OUT>): OUT {
  let ret = firstMapper(src);
  ret = mappers.reduce((previousValue, currentValue) => currentValue(previousValue), ret);

  return ret;
}

/**
 * Equals for compare string and Symbol
 */
export function stringSymbolEquals(str?: string, symbol?: symbol): boolean {
  return symbol ? (symbol.toString() === Symbol(str).toString()) : (symbol as unknown as string) === str;
}

/**
 * XOR
 */
export function xor(x: boolean, y: boolean): boolean {
  return x ? !y : y;
}

const UUID_REGEXP = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.compile();

/**
 * UUID validator
 */
export function isValidUuid(uuid: string): boolean {
  return UUID_REGEXP.test(uuid);
}


export type TOrCallback<T> = NotFunction<T> | (() => T)

export function getTOrCall<T>(value: TOrCallback<T>): T {
  return typeof value == 'function' ? (value as (() => T))() : (value as T);
}
