/* tslint:disable:no-any no-shadowed-variable */
import * as React from "react";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Rendered<T extends React.Component> = React.ReactElement<T["props"]>;

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
