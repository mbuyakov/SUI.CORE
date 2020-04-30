import { Inject } from 'typescript-ioc';

export function DebugInject(...args: any[]): any {
  // eslint-disable-next-line no-console
  console.warn("DEBUG_INJECT", args);
  return Inject(...args)
}
