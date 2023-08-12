import {IconButton, IconButtonProps} from "@sui/deps-material";
import React from "react";
import {ProgressIcon} from "@sui/ui-material";
import {tooltipWrapper} from "@/Material/utils/tooltipWrapper";
import {useOnClick, usePopconfirm} from "@sui/ui-actions";
import {IPopconfirmSettings} from "@/Material/utils";


export type MaterialIconButtonProps = Omit<IconButtonProps, "onClick"> & {
  tooltip?: string;
  loading?: boolean;
  onClick?: () => void | Promise<void>;
  popconfirmSettings?: IPopconfirmSettings;
};

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

  return popconfirm.wrapper(
    tooltipWrapper(tooltip, (
      <IconButton
        {...rest}
        onClick={onClick}
        disabled={loading || rest.disabled}
        size="large">
        {loading ? <ProgressIcon type="iconButton" size={rest.size}/> : rest.children}
      </IconButton>
    ))
  );
};
