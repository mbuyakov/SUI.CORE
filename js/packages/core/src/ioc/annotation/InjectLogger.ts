/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from "@/ioc";

// Please, don't touch. Magic from typescript-ioc
export function InjectLogger(...args: any[]): any {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const target = args[0] as Function;
  const key = args[1] as string;

  const propKey = `__${key}`;
  Object.defineProperty(target.constructor.prototype, key, {
    enumerable: true,
    // eslint-disable-next-line object-shorthand,func-names
    get: function () {
      return this[propKey] ? this[propKey] : this[propKey] = new Logger(target.constructor.name);
    },
    // eslint-disable-next-line object-shorthand,func-names
    set: function (newValue) {
      this[propKey] = newValue;
    }
  });
}
