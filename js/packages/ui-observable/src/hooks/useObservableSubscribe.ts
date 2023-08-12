import {useEffect} from "react";
import {Observable} from "../Observable";
import {ObservableHandler} from "../types";
export function useObservableSubscribe<T>(observable: Observable<T>, handler: ObservableHandler<T>, triggerOnSubscribe = false): void {
  useEffect(() => {
    const handlerStub = observable.subscribe(handler, triggerOnSubscribe);

    return (): void => {
      handlerStub.unsubscribe();
    };

  }, [observable, handler, triggerOnSubscribe]);
}
