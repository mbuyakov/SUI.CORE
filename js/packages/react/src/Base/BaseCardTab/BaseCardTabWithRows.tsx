import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from "@sui/core";
import {BaseCardRow, IBaseCardRowLayout} from "@/Base/BaseCardRow";
import * as React from "react";
import Tabs from "antd/lib/tabs";
import {IBaseCardTabLayout} from "@/Base";

export interface IBaseCardTabWithRows<T, ITEM> {
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<T, ITEM>>;
  title: string;
}

export const BaseCardTabWithRows: <T, ITEM>(props: IBaseCardTabWithRows<T, ITEM> & {
  sourceItem: T
  tabIndex: number,
  forceRenderTabs: boolean
}) => JSX.Element = props => (
  <Tabs.TabPane key={props.tabIndex.toString()} tab={<span>{props.title}</span>} forceRender={props.forceRenderTabs}>
    {wrapInArrayWithoutNulls(props.rows).map((row, index, arr) => (
      <BaseCardRow
        key={index.toString()}
        sourceItem={props.sourceItem}
        row={row}
        rowIndex={index}
        parent="tab"
        rowsLength={arr.length}
      />
    ))}
  </Tabs.TabPane>
);

export function isTabWithRows<T, ITEM>(tab: IBaseCardTabLayout<T, ITEM>): tab is IBaseCardTabWithRows<T, ITEM> {
  return "rows" in tab;
}
