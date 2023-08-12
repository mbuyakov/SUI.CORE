import {useCallback, useState} from "react";
// import {PopupState} from "material-ui-popup-state/hooks";
import {Nullable} from "@sui/util-types";
import {IUsePopconfirmState} from "./usePopconfirm";
import {usePromise, UsePromiseState} from "@sui/lib-hooks";

export type UseOnClickState<T> = UsePromiseState<void> & {
  onClick(arg?: T): void;
};

export type IOnClickIntegration = {
  // popupState?: PopupState,
  popconfirm?: IUsePopconfirmState
};

export function useOnClick<T = never>(onClick: (arg: T) => void | Promise<void>, integration?: IOnClickIntegration): UseOnClickState<T> {
  const [promise, setPromise] = useState<Nullable<Promise<void>>>(null);
  const usePromiseState = usePromise(promise);
  const onClickCb = useCallback((arg: T) => {
    setPromise(async () => {
      //TODO
      // if (integration?.popupState) {
      //   integration.popupState.close();
      // }

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
