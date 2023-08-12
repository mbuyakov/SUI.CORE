import {Observable} from "../Observable";
import {useMemo, useState} from "react";
import {useObservableSubscribe} from "./useObservableSubscribe";

export function useObservableValue<T>(observable: Observable<T>): T {
  const [state, setState] = useState<T>(observable.getValue());
  const handler  = useMemo(() => (it: T) => setState(it), [setState]);
  useObservableSubscribe(observable, handler);

  return state;
}

