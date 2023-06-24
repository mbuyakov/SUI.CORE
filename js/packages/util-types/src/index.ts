export type Class<T> = new (...args: never[]) => T;

export type Nullable<T> = T | null | undefined;

export interface IObjectWithIndex {
  [index: string]: any;
}
