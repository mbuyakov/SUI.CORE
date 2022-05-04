import React from "react";
import {Divider} from "antd";
import {IBaseCardRowLayout} from "@/Base/BaseCardRow/BaseCardRow";


export interface IBaseCardRowWithDividerLayout {
  dividerDashed?: boolean;
  dividerText?: string;
  isDivider: true;
  orientationMargin?: number;
}

export const BaseCardRowWithDivider: React.FC<IBaseCardRowWithDividerLayout> = props => {

  const css = `
      .orientationMargin::before {
        width: ${props.orientationMargin}px !important;
      }
    `

  return (
    <>
      <style>
        {css}
      </style>
      <Divider
        orientation="left"
        dashed={props.dividerDashed}
        className={props.orientationMargin ? "orientationMargin" : null}
      >
        {props.dividerText}
      </Divider>
    </>
  )

};

export function isRowWithDivider<T, ITEM>(row: IBaseCardRowLayout<T, ITEM>): row is IBaseCardRowWithDividerLayout {
  return "isDivider" in row && row.isDivider == true;
}
