import autobind from "autobind-decorator";
import {v4 as uuidv4} from "uuid";
import {getTOrCall, TOrCallback} from "@sui/ui-old-core";

export type ObservableHandler<T> = (newValue: T, oldValue?: T) => void;

export interface ObservableHandlerStub {
  unsubscribe(): void
}

export class Observable<T> {

  private readonly handlers: Map<string, ObservableHandler<T>> = new Map();
  private value: T;

  public constructor(initialValue?: TOrCallback<T>) {
    this.value = getTOrCall(initialValue);
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
  public forceTrigger(): void {
    this.setValue(this.value);
  }

  @autobind
  public subscribe(cb: ObservableHandler<T>, triggerOnSubscribe: boolean = false): ObservableHandlerStub {
    const id = uuidv4();

    this.handlers.set(id, cb);

    if (triggerOnSubscribe) {
      cb(this.value);
    }

    return {
      unsubscribe: (): void => {
        this.handlers.delete(id);
      }
    };
  }
}
