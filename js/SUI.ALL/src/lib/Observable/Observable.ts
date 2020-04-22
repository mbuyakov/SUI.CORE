import autobind from "autobind-decorator";
import uuid from 'uuid/v4';

export type ObservableHandler<T> = (newValue: T, oldValue?:T) => void;

export interface ObservableHandlerStub {
  unsubscribe(): void
}

export class Observable<T> {

  private readonly handlers: Map<string, ObservableHandler<T>> = new Map();
  private value: T;

  public constructor(initialValue?: T) {
    this.value = initialValue;
  }

  @autobind
  public getValue(): T {
    return this.value;
  }

  @autobind
  public setValue(value: T): void {
    const oldValue = this.value;
    this.value = value;
    Array.from(this.handlers.values()).forEach(cb => cb(value, oldValue));
  }

  @autobind
  public subscribe(cb: ObservableHandler<T>): ObservableHandlerStub {
    const id = uuid();

    this.handlers.set(id, cb);

    return {
      unsubscribe: (): void => {
        this.handlers.delete(id);
      }
    };
  }
}
