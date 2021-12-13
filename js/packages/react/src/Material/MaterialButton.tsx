import {Button, ButtonProps} from "@material-ui/core";
import React from "react";
import {useOnClick} from "@/hooks";
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
  const {loading: onClickLoading, onClick} = useOnClick(propsOnClick);
  const loading = onClickLoading || propsLoading;

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
