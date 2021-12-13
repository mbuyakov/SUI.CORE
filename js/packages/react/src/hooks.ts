import {Nullable, query} from "@sui/core";
import {DependencyList, useCallback, useEffect, useMemo, useState} from "react";
import {Container} from "typescript-ioc";
import {errorNotification} from "./drawUtils";

export function useAsyncEffect(effect: () => Promise<void>, deps: DependencyList): void {
  useEffect(() => {
    effect().catch(e => {
      console.error(e);
      const errorMessage = e.response?.data?.message ?? e.stack ?? e.toString();
      errorNotification("Ошибка при обработки запроса", errorMessage);
    })
  }, deps);
}

export function useQuery<T>(queryBody: string | any, extractKeysLevel?: boolean | number, deps: DependencyList = []): T {
  const [data, setData] = useState<T>();
  useAsyncEffect(async () => {
    const data = await query<T>(queryBody, extractKeysLevel);
    setData(data);
  }, deps);
  return data;
}

export function useService<T>(source: Function & { prototype: T }): T {
  return useMemo(() => Container.get(source), []);
}

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

export type UseOnClickState<T, R> = UsePromiseState<R> & {
  onClick(arg?: T): R | Promise<R>;
}

export function useOnClick<T = never, R = void>(onClick: (arg: T) => R | Promise<R>): UseOnClickState<T, R> {
  const [promise, setPromise] = useState<Promise<R>>(null);
  const usePromiseState = usePromise(promise);
  const onClickCb = useCallback((arg) => {
    const onClickRet = onClick?.(arg);
    if ((onClickRet as Promise<R>)?.then) {
      setPromise(onClickRet as Promise<R>);
    }
    return onClickRet;
  }, [onClick]);

  return {
    ...usePromiseState,
    onClick: onClickCb
  };
}
