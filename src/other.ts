import Timeout = NodeJS.Timeout;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Return promise, that resolve after given ms
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve: () => void): Timeout => setTimeout(resolve, ms));
}
