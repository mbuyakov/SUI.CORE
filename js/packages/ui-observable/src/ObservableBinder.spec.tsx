import renderer from "react-test-renderer";

import {ObservableBinder} from "./ObservableBinder";
import {Observable} from "./Observable";

describe("ObservableBinder", () => {
  it("should render initial value", () => {
    const component = renderer.create(
      <ObservableBinder observable={new Observable(1)}>
      {(value) => value}
    </ObservableBinder>
    );
    expect(component.toJSON()).toBe("1");
  });

  it("should update value", () => {
    const observable = new Observable(1);
    const component = renderer.create(
      <ObservableBinder observable={observable}>
        {(value) => value}
      </ObservableBinder>
    );
    observable.setValue(2);
    expect(component.toJSON()).toBe("2");
  });

  it("should unsubscribe on unmount", () => {
    const observable = new Observable(1);
    const component = renderer.create(
      <ObservableBinder observable={observable}>
        {(value) => value}
      </ObservableBinder>
    );
    expect((observable as any).handlers.size).toBe(1);
    component.unmount();
    expect((observable as any).handlers.size).toBe(0);
  });
});
