import {IconButton, IconButtonProps} from "@material-ui/core";
import React from "react";
import {ProgressIcon} from "@/Material/ProgessIcon";
import {tooltipWrapper} from "@/Material/utils/tooltipWrapper";
import {IPopconfirmSettings, useOnClick, usePopconfirm} from "@/Material/utils";


export type MaterialIconButtonProps = Omit<IconButtonProps, 'onClick'> & {
  tooltip?: string;
  loading?: boolean;
  onClick?: () => void | Promise<void>;
  popconfirmSettings?: IPopconfirmSettings;
}

export const MaterialIconButton: React.FC<MaterialIconButtonProps> = (
  {
    popconfirmSettings,
    tooltip,
    onClick: propsOnClick,
    loading: propsLoading,
    ...rest
  }) => {
  const popconfirm = usePopconfirm(popconfirmSettings);
  const {loading: onClickLoading, onClick} = useOnClick(propsOnClick, {popconfirm});
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
