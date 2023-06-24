/* eslint-disable @typescript-eslint/no-explicit-any */
import {InjectValue} from 'typescript-ioc';

export function Value(value: string): any {
  const iv = InjectValue(value);
  return (...args: any[]): any => {
    // Kludge
    return iv(args[0], args[1]);
  }
}
