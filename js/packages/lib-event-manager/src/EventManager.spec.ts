import {SuiEvent} from "./SuiEvent";
import {EventManager} from "./EventManager";

class TestEvent1 extends SuiEvent {
  constructor() {
    super("TestEvent1");
  }
}

class TestEvent2 extends SuiEvent {
  constructor() {
    super("TestEvent2");
  }
}

describe("EventManager", () => {
  test("Basic usage", () => {
    const eventManager = new EventManager<TestEvent1 | TestEvent2>();
    const consumer = jest.fn();

    eventManager.addHandler(TestEvent1, consumer);
    eventManager.addHandler(TestEvent2, consumer);
    eventManager.dispatch(TestEvent1, new TestEvent1());
    eventManager.dispatch(TestEvent2, new TestEvent2());

    expect(consumer).toBeCalledTimes(2);
  });

  test("Multiple handlers", () => {
    const eventManager = new EventManager<TestEvent1>();
    const consumer = jest.fn();

    eventManager.addHandler(TestEvent1, consumer);
    eventManager.addHandler(TestEvent1, consumer);
    eventManager.dispatch(TestEvent1, new TestEvent1());

    expect(consumer).toBeCalledTimes(2);
  });

  test("Delete handler", () => {
    const eventManager = new EventManager<TestEvent1 | TestEvent2>();
    const consumer = jest.fn();

    eventManager.addHandler(TestEvent1, consumer).unsubscribe();
    eventManager.dispatch(TestEvent1, new TestEvent1());

    expect(consumer).not.toBeCalled();
  });
});
