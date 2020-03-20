import {ButtonProps} from "antd/lib/button";
import {DropDownProps} from "antd/lib/dropdown";
import {MenuProps} from "antd/lib/menu";
import {MenuItemProps} from "antd/lib/menu/MenuItem";
import { PopconfirmProps } from "antd/lib/popconfirm";
import {TooltipProps} from "antd/lib/tooltip";
import React from 'react';

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
