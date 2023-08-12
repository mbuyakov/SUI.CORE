import {act, create, ReactTestRenderer} from "react-test-renderer";

import {ObservableBinder} from "./ObservableBinder";
import {Observable} from "./Observable";

describe("ObservableBinder", () => {
  it("should render initial value", () => {
    let component: ReactTestRenderer = null as never;
    act(() => {
      component = create(
        <ObservableBinder observable={new Observable(1)}>
          {(value) => value}
        </ObservableBinder>
      );
    });
    expect(component.toJSON()).toBe("1");
  });

  it("should update value", () => {
    const observable = new Observable(1);
    let component: ReactTestRenderer = null as never;
    act(() => {
      component = create(
        <ObservableBinder observable={observable}>
          {(value) => value}
        </ObservableBinder>
      );
    });
    act(() => {
      observable.setValue(2);
    });
    expect(component.toJSON()).toBe("2");
  });

  it("should have some handler after update value", () => {
    const observable = new Observable(1);
    act(() => {
      create(
        <ObservableBinder observable={observable}>
          {(value) => value}
        </ObservableBinder>
      );
    });
    const handlers = [...(observable as any).handlers.keys()];
    act(() => {
      observable.setValue(2);
    });
    expect(handlers).toEqual([...(observable as any).handlers.keys()]);
  });

  it("should unsubscribe on unmount", () => {
    const observable = new Observable(1);
    let component: ReactTestRenderer = null as never;
    act(() => {
      component = create(
        <ObservableBinder observable={observable}>
          {(value) => value}
        </ObservableBinder>
      );
    });
    expect((observable as any).handlers.size).toBe(1);
    act(() => component.unmount());
    expect((observable as any).handlers.size).toBe(0);
  });
});
