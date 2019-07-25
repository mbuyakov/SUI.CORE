/* tslint:disable:no-any no-shadowed-variable */
import {WrappedFormUtils} from "antd/lib/form/Form";
import * as H from "history";
import * as React from "react";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Rendered<T extends React.Component> = React.ReactElement<T["props"]>;

// tslint:disable-next-line:completed-docs
export type FormCreateKostyl<T extends React.Component<{form?: WrappedFormUtils}>> =
  Omit<T extends React.Component<infer U> ? U : T, 'form'>;

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
  combiner: (v: V, values: U | undefined) => U = (v, values) => [...(values as any|| []), v] as any
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
  valueExtractor: (v: V) => U = v => v as any as U
): Map<K, U> {
  const result = new Map<K, U>();
  array.forEach(element => result.set(keyExtractor(element), valueExtractor(element)));

  return result;
}

/**
 * Find element in array
 */
export function findByValue<T, V>(array: T[], valueExtractor: (element: T) => V, value: V): T | undefined {
  return array.find(element => valueExtractor(element) === value);
}

/**
 * React router location type
 */
// tslint:disable-next-line
export interface location<QueryParams extends { [K in keyof QueryParams]?: string } = {}, S = any> extends H.Location<S> {
  // tslint:disable-next-line:completed-docs
  query: QueryParams;
}
