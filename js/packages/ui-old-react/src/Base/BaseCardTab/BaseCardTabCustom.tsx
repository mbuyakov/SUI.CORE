import {Tabs} from "@sui/deps-antd";
import * as React from "react";

// noinspection ES6PreferShortImport
import {IBaseCardTabLayout} from "./BaseCardTab";

export interface IBaseCardTabCustom<T> {
  key?: string;
  title: string;
  render(item: T): JSX.Element | string;
}

export const BaseCardTabCustom: <T>(props: IBaseCardTabCustom<T> & {
  sourceItem: T,
  tabIndex: number,
  forceRenderTabs: boolean
}) => JSX.Element = props => (
  <Tabs.TabPane
    key={props.key ?? props.tabIndex.toString()}
    tab={<span>{props.title}</span>}
    forceRender={props.forceRenderTabs}
  >
    {props.render(props.sourceItem)}
  </Tabs.TabPane>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isCustomTab<T>(tab: IBaseCardTabLayout<T, any>): tab is IBaseCardTabCustom<T> {
  return "render" in tab;
}
