import {Observable} from "./Observable";

describe("Observable", () => {
  it("should return initial value", () => {
    const observableT = new Observable(1);
    const observableTCallback = new Observable(() => 2);
    expect(observableT.getValue()).toBe(1);
    expect(observableTCallback.getValue()).toBe(2);
  });

  it("should update value", () => {
    const observableT = new Observable<number | null>(null);
    observableT.setValue(1);
    expect(observableT.getValue()).toBe(1);
  });

  it("should trigger subscriber", () => {
    const sub1 = jest.fn();
    const sub2 = jest.fn();
    const observable = new Observable<number | null>(null);
    observable.subscribe(sub1);
    observable.setValue(1);
    observable.subscribe(sub2, true);
    expect(sub1).toBeCalledTimes(1);
    expect(sub2).toBeCalledTimes(1);
  });

  it("should unsubscribe", () => {
    const sub1 = jest.fn();
    const observable = new Observable<number | null>(null);
    const subStub = observable.subscribe(sub1);
    observable.setValue(1);
    subStub.unsubscribe();
    observable.setValue(1);
    expect(sub1).toBeCalledTimes(1);
  });

  it("should force update", () => {
    const sub1 = jest.fn();
    const observable = new Observable<number | null>(null);
    observable.subscribe(sub1);
    observable.setValue(1);
    observable.forceTrigger();
    expect(sub1).toBeCalledTimes(2);
  });
});
