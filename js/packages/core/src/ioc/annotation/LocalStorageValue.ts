/* eslint-disable @typescript-eslint/no-explicit-any */
import {Container} from 'typescript-ioc';

// Don't touch import
// noinspection ES6PreferShortImport
import {Logger} from '../utils';
// noinspection ES6PreferShortImport
import {LocalStorageService} from '../service/LocalStorageService';
// noinspection ES6PreferShortImport
import {Nullable} from '../../other';

export interface LocalStorageValueWrapper {
  get(): Nullable<string>;

  set(value: Nullable<string>): void;
}

export function _LocalStorageValue(localStorageKey: string): LocalStorageValueWrapper {
  const localStorageService = Container.get(LocalStorageService);
  const log = new Logger("LocalStorageValue");
  return {
    get(): string {
      return localStorageService.getItem(localStorageKey);
    },
    set(newValue: string): void {
      const oldValue = localStorageService.getItem(localStorageKey);
      log.info(`[${localStorageKey}] ${oldValue} -> ${newValue}`);
      if (newValue == null) {
        localStorageService.removeItem(localStorageKey);
      } else {
        localStorageService.setItem(localStorageKey, newValue);
      }
    },
  };
}

// Please, don't touch. Magic from typescript-ioc
export function LocalStorageValue(localStorageKey: string) {
  return (...args: any[]): void => {
    console.debug('@LocalStorageValue', localStorageKey, args);

    // eslint-disable-next-line @typescript-eslint/ban-types
    const target = args[0] as Function;
    const key = args[1] as string;
    const wrapper = _LocalStorageValue(localStorageKey);

    Object.defineProperty(target.constructor.prototype, key, {
      enumerable: true,
      // eslint-disable-next-line object-shorthand,func-names
      get: function () {
        return wrapper;
      },
      // eslint-disable-next-line object-shorthand,func-names
      set: function () {
        console.debug("Can't set LocalStorageValue wrapper!");
        // throw new Error("Can't set LocalStorageValue wrapper!")
      },
    });
  };
}
