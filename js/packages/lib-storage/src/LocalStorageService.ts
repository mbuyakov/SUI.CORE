import {Container, SingletonAndOnlyIoc} from "@sui/deps-ioc";
import {Nullable} from "@sui/util-types";
import {LSKeyWrapper, LSKeyWrapperImpl} from "./LSKeyWrapper";
abstract class LocalStorageService {
  abstract getItem<T extends string>(key: string): T | null;
  abstract setItem<T extends string>(key: string, value: Nullable<T>): void;
  abstract getKeyWrapper<T extends string>(key: string): LSKeyWrapper<T>;
}

export class LocalStorageServiceImpl extends LocalStorageService {
  private projectKey = Container.getValue("sui.projectKey");

  override getItem<T extends string>(key: string): T | null {
    return localStorage.getItem(`${this.projectKey}_${key}`) as T | null;
  }

  override setItem<T extends string>(key: string, value: Nullable<T>) {
    if (value == null) {
      localStorage.removeItem(`${this.projectKey}_${key}`);
    } else {
      localStorage.setItem(`${this.projectKey}_${key}`, value);
    }
  }

  override getKeyWrapper<T extends string>(key: string): LSKeyWrapper<T> {
    return new LSKeyWrapperImpl(this, key);
  }
}

const _LocalStorageService = SingletonAndOnlyIoc(LocalStorageService);
export {_LocalStorageService as LocalStorageService};
