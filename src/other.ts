import Timeout = NodeJS.Timeout;
import * as React from "react";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Rendered<T extends React.Component> = React.ReactElement<T["props"]>;

/**
 * Return promise, that resolve after given ms
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve: () => void): Timeout => setTimeout(resolve, ms));
}
