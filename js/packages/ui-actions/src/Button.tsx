import React, {MouseEvent} from "react";
import {Button as MuiButton, ButtonProps as MuiButtonProps} from "@sui/deps-material";
import {ProgressIcon, TooltipWrapper} from "@sui/ui-material";
import {PopconfirmSettings, useOnClick, usePopconfirm} from "./hooks";

export type ButtonProps = Omit<MuiButtonProps, 'onClick'> & {
  tooltip?: string;
  loading?: boolean;
  popconfirmSettings?: PopconfirmSettings;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}
export const Button: React.FC<ButtonProps> =
  (
    {
      popconfirmSettings,
      tooltip,
      onClick: propsOnClick,
      loading: propsLoading,
      ...rest
    }) => {
    const popconfirm = usePopconfirm(popconfirmSettings);
    const {loading: onClickLoading, onClick} = useOnClick<MouseEvent<HTMLButtonElement>>(propsOnClick, {popconfirm});

    const loading = onClickLoading || propsLoading;

    return popconfirm.wrapper(
      <TooltipWrapper
        title={tooltip}
      >
        <MuiButton
          {...rest}
          onClick={onClick}
          startIcon={loading ? <ProgressIcon type="icon" size={rest.size}/> : rest.startIcon}
          disabled={loading || rest.disabled}
        />
      </TooltipWrapper>
    );
  }
