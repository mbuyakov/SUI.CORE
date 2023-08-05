import {v4 as uuidv4} from "uuid";
import {getTOrCall, TOrCallback} from "@sui/util-chore";
import {ObservableHandler, ObservableHandlerStub} from "./types";

export class Observable<T> {

  private readonly handlers: Map<string, ObservableHandler<T>> = new Map();
  private value: T;

  public constructor(initialValue: TOrCallback<T>) {
    this.value = getTOrCall(initialValue);
  }

  public getValue(): T {
    return this.value;
  }

  public setValue(value: T): void {
    const oldValue = this.value;
    this.value = value;
    Array.from(this.handlers.values()).forEach(cb => cb(value, oldValue));
  }

  public forceTrigger(): void {
    this.setValue(this.value);
  }

  public subscribe(cb: ObservableHandler<T>, triggerOnSubscribe = false): ObservableHandlerStub {
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
