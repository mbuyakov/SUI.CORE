/* eslint-disable @typescript-eslint/no-explicit-any */
import { Container } from 'typescript-ioc';

// Don't touch import
// noinspection ES6PreferShortImport
import { Logger } from '../utils';
// noinspection ES6PreferShortImport
import { LocalStorageService } from '../service/LocalStorageService';
// noinspection ES6PreferShortImport
import { Nullable } from '../../other';

export interface LocalStorageValueWrapper {
  get(): Nullable<string>;
  set(value: Nullable<string>): void;
}

export function _LocalStorageValue(localStorageKey: string, target: any, key: string = localStorageKey): LocalStorageValueWrapper {
  const localStorageService = Container.get(LocalStorageService);
  const log = new Logger("LocalStorageValue");

  const propKey = `__${key}`;
  const propKeyInit = `${propKey}__init`;
  const _this = target.constructor.prototype;
  return {
    get() {
      if(!_this[propKeyInit]) {
        const newValue = localStorageService.getItem(localStorageKey);
        log.info(`[${localStorageKey}] Init. Readed value: ${newValue}`);
        _this[propKey] = newValue;
        _this[propKeyInit] = true;
      }
      return _this[propKey];
    },
    set(newValue: string) {
      if(!_this[propKeyInit]) {
        log.debug(`[${localStorageKey}] Skip init. Setter called before read value`);
        _this[propKeyInit] = true;
      }
      const oldValue = _this[propKey];
      log.info(`[${localStorageKey}] ${oldValue} -> ${newValue}`);
      if(newValue == null) {
        localStorageService.removeItem(localStorageKey);
      } else {
        localStorageService.setItem(localStorageKey, newValue);
      }
      _this[propKey] = newValue;
    },
  };
}

// Please, don't touch. Magic from typescript-ioc
export function LocalStorageValue(localStorageKey: string) {
  return (...args: any[]) => {
    console.debug('@LocalStorageValue', localStorageKey, args);

    const target = args[0] as Function;
    const key = args[1] as string;
    const wrapper = _LocalStorageValue(localStorageKey, target, key);

    Object.defineProperty(target.constructor.prototype, key, {
      enumerable: true,
      // eslint-disable-next-line object-shorthand,func-names
      get: function() {
        return wrapper;
      },
      // eslint-disable-next-line object-shorthand,func-names
      set: function() {
        throw new Error("Can't set LocalStorageValue wrapper!")
      },
    });
  };
}
