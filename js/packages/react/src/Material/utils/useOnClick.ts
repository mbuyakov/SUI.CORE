import {useCallback, useState} from "react";
import {usePromise, UsePromiseState} from "@/hooks";

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
