import React from "react";
import {Divider} from "antd";
import {IBaseCardRowLayout} from "@/Base/BaseCardRow/BaseCardRow";


export interface IBaseCardRowWithDividerLayout {
  dividerDashed?: boolean;
  dividerText?: string;
  isDivider: true;
}

export const BaseCardRowWithDivider: React.FC<IBaseCardRowWithDividerLayout> = props => (
  <Divider
    orientation="left"
    dashed={props.dividerDashed}
  >
    {props.dividerText}
  </Divider>
);

export function isRowWithDivider<T, ITEM>(row: IBaseCardRowLayout<T, ITEM>): row is IBaseCardRowWithDividerLayout {
  return "isDivider" in row && row.isDivider == true;
}
