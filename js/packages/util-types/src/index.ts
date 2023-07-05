export type Class<T> = new (...args: never[]) => T;

export type Nullable<T> = T | null | undefined;

// eslint-disable-next-line @typescript-eslint/ban-types
export type NotFunction<T> = T extends Function ? never : T;

export interface IObjectWithIndex {
  [index: string]: any;
}
