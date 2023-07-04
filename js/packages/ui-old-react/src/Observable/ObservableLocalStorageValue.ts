import {LocalStorageService, TOrCallback} from "@sui/ui-old-core";
import {Container} from "@sui/deps-ioc";
import {Observable} from "@/Observable/Observable";
import {Nullable} from "@sui/util-types";

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
