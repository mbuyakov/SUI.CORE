import {ButtonProps, DropDownProps, MenuItemProps, MenuProps, PopconfirmProps, TooltipProps} from "@sui/deps-antd";
import React from "react";

export type TransitionButtonProps = Omit<ButtonProps, "children" | "disabled" | "onClick">;

export interface ITransitionStatus<TID = string> {
  id: TID;
}

export interface IButtonBase {
  disabled?: boolean;
  name: React.ReactElement;
  popconfirmProps?: Omit<PopconfirmProps, "onConfirm">;
  tooltip?: TooltipProps;
}

export interface IResolution extends IButtonBase {
  id: string;
  menuItemProps?: Omit<MenuItemProps, "disabled">;
}

export interface ITransition<TID = string> extends IButtonBase {
  buttonProps?: TransitionButtonProps;
  dropDownProps?: Omit<DropDownProps, "overlay">; // Only if has resolutions
  fromId: TID;
  menuProps?: Omit<MenuProps, "onClick">; // Only if has resolutions
  resolutions?: IResolution[];
  toId: TID;
}
