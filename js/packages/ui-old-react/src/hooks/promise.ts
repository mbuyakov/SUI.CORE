import {Nullable} from "@sui/ui-old-core";
import {useState} from "react";
import {useAsyncEffect} from "./async";

export interface UsePromiseState<T> {
  loading: boolean;
  error?: Error | any;
  value?: T;
}

export function usePromise<T>(promise: Nullable<Promise<T>>): UsePromiseState<T> {
  const [state, setState] = useState<UsePromiseState<T>>({loading: false});

  useAsyncEffect(() => {
    if (!promise) {
      return Promise.resolve();
    }

    setState({loading: true});
    return promise
      .then(value => setState({loading: false, value}))
      .catch(e => {
        setState({loading: false, error: e});
        throw e;
      })
  }, [promise]);

  return state;
}
