/* eslint-disable @typescript-eslint/no-explicit-any */
import { Container } from 'typescript-ioc';
import { Logger } from '../utils';
// Don't touch import
// noinspection ES6PreferShortImport
import { LocalStorageService } from '../service/LocalStorageService';

// Please, don't touch. Magic from typescript-ioc
export function LocalStorageValue(localStorageKey: string) {
  return (...args: any[]) => {
    console.debug('@LocalStorageValue', localStorageKey, args);
    const localStorageService = Container.get(LocalStorageService);
    const log = new Logger("LocalStorageValue");

    const target = args[0] as Function;
    const key = args[1] as string;

    const propKey = `__${key}`;
    const propKeyInit = `${propKey}__init`;
    Object.defineProperty(target, key, {
      enumerable: true,
      // eslint-disable-next-line object-shorthand,func-names
      get: function() {
        if(!this[propKeyInit]) {
          const newValue = localStorageService.getItem(localStorageKey);
          log.info(`[${localStorageKey}] Init. Readed value: ${newValue}`);
          this[propKey] = newValue;
          this[propKeyInit] = true;
        }
        return this[propKey];
      },
      // eslint-disable-next-line object-shorthand,func-names
      set: function(newValue) {
        if(!this[propKeyInit]) {
          log.warn(`[${localStorageKey}] Skip init. Setter called before read value`);
          this[propKeyInit] = true;
        }
        const oldValue = this[propKey];
        log.info(`[${localStorageKey}] ${oldValue} -> ${newValue}`);
        localStorageService.setItem(localStorageKey, newValue);
        this[propKey] = newValue;
      },
    });
  };
}
