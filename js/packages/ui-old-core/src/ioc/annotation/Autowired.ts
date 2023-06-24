/* eslint-disable @typescript-eslint/no-explicit-any */
import {Inject} from 'typescript-ioc';

export function Autowired(...args: any[]): any {
  console.debug('@Autowired', args);
  // Kludge
  return Inject(args[0], args[1]);
}
