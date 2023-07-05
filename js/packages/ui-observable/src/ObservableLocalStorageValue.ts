import {Container} from "@sui/deps-ioc";
import {Observable} from "./Observable";
import {LocalStorageService} from "@sui/lib-storage";
import {TOrCallback} from "@sui/util-chore";

export class ObservableLocalStorageValue<T extends string> extends Observable<T> {

  constructor(key: string, initialValue: TOrCallback<T>) {
    const lsKeyWrapper = Container.get(LocalStorageService).getKeyWrapper(key);

    let currentValue = lsKeyWrapper.get() as TOrCallback<T>;
    if (currentValue == null) {
      currentValue = initialValue;
    }

    super(currentValue);

    this.subscribe(newValue => {
      lsKeyWrapper.set(key);
    });
  }
}
