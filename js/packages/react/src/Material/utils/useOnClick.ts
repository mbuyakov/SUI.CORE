import {useCallback, useState} from "react";
import {usePromise, UsePromiseState} from "@/hooks";
import {IusePopconfirmState} from "@/Material";

export type UseOnClickState<T> = UsePromiseState<void> & {
  onClick(arg?: T): void | Promise<void>;
}

export function useOnClick<T = never>(onClick: (arg: T) => void | Promise<void>, popconfirm?: IusePopconfirmState): UseOnClickState<T> {
  const [promise, setPromise] = useState<Promise<void>>(null);
  const usePromiseState = usePromise(promise);
  const onClickCb = useCallback((arg) => {
    setPromise(async () => {
      if (popconfirm) {
        const result = await popconfirm.getResult();
        if (!result) {
          return;
        }
      }

      const onClickRet = onClick?.(arg);
      if ((onClickRet as Promise<void>)?.then) {
        await onClickRet;
      }
    });
  }, [onClick, popconfirm]);

  return {
    ...usePromiseState,
    onClick: onClickCb
  };
}
