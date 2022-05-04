import {useCallback, useState} from "react";
import {PopupState} from "material-ui-popup-state/hooks";
import {usePromise, UsePromiseState} from "@/hooks";
import {IusePopconfirmState} from "@/Material";

export type UseOnClickState<T> = UsePromiseState<void> & {
  onClick(arg?: T): void | Promise<void>;
}

export type IOnClickIntegration = {
  popupState?: PopupState,
  popconfirm?: IusePopconfirmState
}

export function useOnClick<T = never>(onClick: (arg: T) => void | Promise<void>, integration?: IOnClickIntegration): UseOnClickState<T> {
  const [promise, setPromise] = useState<Promise<void>>(null);
  const usePromiseState = usePromise(promise);
  const onClickCb = useCallback((arg) => {
    setPromise(async () => {
      if (integration?.popupState) {
        integration.popupState.close();
      }

      if (integration?.popconfirm) {
        const result = await integration.popconfirm.getResult();
        if (!result) {
          return;
        }
      }

      const onClickRet = onClick?.(arg);
      if ((onClickRet as Promise<void>)?.then) {
        await onClickRet;
      }
    });
  }, [onClick, integration]);

  return {
    ...usePromiseState,
    onClick: onClickCb
  };
}
