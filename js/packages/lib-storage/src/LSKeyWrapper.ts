import {Nullable} from "@sui/util-types";
import {LocalStorageService} from "./LocalStorageService";
export abstract class LSKeyWrapper<T extends string = string> {
  abstract get(): T | null;
  abstract set(value: Nullable<T>): void;
  abstract remove(): void;
}

export class LSKeyWrapperImpl<T extends string = string> extends LSKeyWrapper<T> {
  private readonly localStorageService: InstanceType<typeof LocalStorageService>;
  private readonly key: string;

  constructor(localStorageService: InstanceType<typeof LocalStorageService>, key: string) {
    super();
    this.localStorageService = localStorageService;
    this.key = key;
  }

  override get(): T | null {
    return this.localStorageService.getItem<T>(this.key);
  }

  override set(value: Nullable<T>) {
    this.localStorageService.setItem<T>(this.key, value);
  }

  override remove() {
    this.localStorageService.removeItem(this.key);
  }
}
