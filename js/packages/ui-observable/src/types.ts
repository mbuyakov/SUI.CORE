export type ObservableHandler<T> = (newValue: T, oldValue?: T) => void;

export interface ObservableHandlerStub {
  unsubscribe(): void
}
