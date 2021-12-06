import {IconButton, IconButtonProps} from "@material-ui/core";
import React, {useCallback, useState} from "react";
import {usePromise} from "@/hooks";
import {ProgressIcon} from "@/Material/ProgessIcon";
import {tooltipWrapper} from "@/Material/utils";


export type MaterialIconButtonProps = Omit<IconButtonProps, 'onClick'> & {
  tooltip?: string;
  loading?: boolean;
  onClick?: () => void | Promise<void>;
}

export const MaterialIconButton: React.FC<MaterialIconButtonProps> = (
  {
    tooltip,
    onClick: propsOnClick,
    loading: propsLoading,
    ...rest
  }) => {
  const [promise, setPromise] = useState<Promise<void>>(null);
  const {loading: promiseLoading} = usePromise(promise);
  const loading = promiseLoading || propsLoading;

  const onClick = useCallback(() => {
    const onClickRet = propsOnClick?.();
    if ((onClickRet as Promise<void>)?.then) {
      setPromise(onClickRet as Promise<void>);
    }
  }, [propsOnClick]);

  return tooltipWrapper(tooltip, (
    <IconButton
      {...rest}
      onClick={onClick}
      disabled={loading || rest.disabled}
    >
      {loading ? <ProgressIcon type="iconButton" size={rest.size} /> : rest.children}
    </IconButton>
  ));
}
