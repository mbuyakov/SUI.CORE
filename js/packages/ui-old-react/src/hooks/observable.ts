import {useEffect, useState} from "react";
import {Observable, ObservableHandler} from "@/Observable";

export function useObservableSubscribe<T>(observable: Observable<T>, handler: ObservableHandler<T>): void {

  useEffect(() => {
    const handlerStub = observable.subscribe(handler);

    return (): void => handlerStub.unsubscribe();

  }, [observable]);
}

export function useObservableValue<T>(observable: Observable<T>): T {
  const [state, setState] = useState<T>(observable.getValue());

  useObservableSubscribe(observable, it => setState(it));

  return state;
}
