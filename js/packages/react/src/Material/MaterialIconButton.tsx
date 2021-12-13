import {IconButton, IconButtonProps} from "@material-ui/core";
import React from "react";
import {useOnClick} from "@/hooks";
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
  const {loading: onClickLoading, onClick} = useOnClick(propsOnClick);
  const loading = onClickLoading || propsLoading;

  return tooltipWrapper(tooltip, (
    <IconButton
      {...rest}
      onClick={onClick}
      disabled={loading || rest.disabled}
    >
      {loading ? <ProgressIcon type="iconButton" size={rest.size}/> : rest.children}
    </IconButton>
  ));
}
