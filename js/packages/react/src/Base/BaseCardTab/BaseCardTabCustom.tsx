import {IBaseCardTabLayout} from "@/Base";
import Tabs from "antd/lib/tabs";
import * as React from "react";

export interface IBaseCardTabCustom<T> {
  title: string;
  render(item: T): JSX.Element | string;
}

export const BaseCardTabCustom: <T>(props: IBaseCardTabCustom<T> & {
  sourceItem: T,
  tabIndex: number,
  forceRenderTabs: boolean
}) => JSX.Element = props => (
  <Tabs.TabPane
    key={props.tabIndex.toString()}
    tab={<span>{props.title}</span>}
    forceRender={props.forceRenderTabs}
  >
    {props.render(props.sourceItem)}
  </Tabs.TabPane>
);

export function isCustomTab<T>(tab: IBaseCardTabLayout<T, any>): tab is IBaseCardTabCustom<T> {
  return "render" in tab;
}
