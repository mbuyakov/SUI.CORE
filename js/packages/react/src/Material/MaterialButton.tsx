import {Button, ButtonProps} from "@material-ui/core";
import React, {useCallback, useState} from "react";
import {usePromise} from "@/hooks";
import {ProgressIcon} from "@/Material/ProgessIcon";
import {tooltipWrapper} from "@/Material/utils";

export type MaterialButtonProps = Omit<ButtonProps, 'onClick'> & {
  tooltip?: string;
  loading?: boolean;
  onClick?: () => void | Promise<void>;
}

export const MaterialButton: React.FC<MaterialButtonProps> = (
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
  }, []);

  return tooltipWrapper(tooltip, (
    <Button
      {...rest}
      onClick={onClick}
      startIcon={loading ? <ProgressIcon type="icon" size={rest.size}/> : rest.startIcon}
      disabled={loading || rest.disabled}
      style={{textTransform: 'none', ...rest.style}}
    />
  ));
}
