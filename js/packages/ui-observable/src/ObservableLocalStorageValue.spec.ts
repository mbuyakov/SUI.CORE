import {ObservableLocalStorageValue} from "./ObservableLocalStorageValue";
import {Container} from "@sui/deps-ioc";
import {LocalStorageService} from "@sui/lib-storage";

describe("ObservableLocalStorageValue", () => {
  beforeEach(() => {
    Container.bind(LocalStorageService).factory(() => ({
      getKeyWrapper:  () => ({
        get: () => null,
        set: () => null
      })
    }));
  });

  it("should subscribe on init", () => {
    const observable = new ObservableLocalStorageValue("key", "");
    expect((observable as any).handlers.size).toBe(1);
  });

  it("should use initial value if field is empty", () => {
    const observable = new ObservableLocalStorageValue("key", "1");
    expect(observable.getValue()).toBe("1");
  });

  it("should use value if field is not empty", () => {
    const mock = jest.fn(() => "2");
    Container.bind(LocalStorageService).factory(() => ({
      getKeyWrapper:  () => ({
        get: mock
      })
    }));
    const observable = new ObservableLocalStorageValue("key", "1");
    expect(observable.getValue()).toBe("2");
  });

  it("should update field if observable value changed", () => {
    const mock = jest.fn();
    Container.bind(LocalStorageService).factory(() => ({
      getKeyWrapper:  () => ({
        get: () => null,
        set: mock
      })
    }));
    const observable = new ObservableLocalStorageValue<string>("key", "1");
    observable.setValue("2");
    expect(mock).toBeCalledTimes(1);
  });
});
