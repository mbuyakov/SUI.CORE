import {Button, ButtonProps} from "@sui/deps-material";
import React from "react";
import {ProgressIcon} from "@sui/ui-material";
import {tooltipWrapper} from "@/Material/utils/tooltipWrapper";
import {useOnClick, usePopconfirm} from "@sui/ui-actions";
import {IPopconfirmSettings} from "@/Material/utils";

export type MaterialButtonProps = Omit<ButtonProps, "onClick"> & {
  tooltip?: string;
  loading?: boolean;
  popconfirmSettings?: IPopconfirmSettings;
  onClick?: () => void | Promise<void>;
};

export const MaterialButton: React.FC<MaterialButtonProps> = (
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
      <Button
        {...rest}
        onClick={onClick}
        startIcon={loading ? <ProgressIcon type="icon" size={rest.size}/> : rest.startIcon}
        disabled={loading || rest.disabled}
        style={{textTransform: "none", ...rest.style}}
      />
    ))
  );
};
