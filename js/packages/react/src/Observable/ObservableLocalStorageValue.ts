import {LocalStorageService, Nullable, TOrCallback} from "@sui/core";
import {Container} from "typescript-ioc";
import {Observable} from "@/Observable/Observable";

export class ObservableLocalStorageValue<T extends string> extends Observable<T> {

  constructor(key: string, initialValue: TOrCallback<T>) {
    const localStorageService = Container.get(LocalStorageService);

    let currentValue: TOrCallback<T> = localStorageService.getItem(key) as TOrCallback<Nullable<T>>;
    if (currentValue == null) {
      currentValue = initialValue;
    }

    super(currentValue);

    this.subscribe(newValue => {
      if (newValue == null) {
        localStorageService.removeItem(key);
      } else {
        localStorageService.setItem(key, newValue);
      }
    });
  }
}
