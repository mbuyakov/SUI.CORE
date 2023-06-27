import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from "@sui/ui-old-core";
import {Tabs} from "@sui/deps-antd";
import * as React from "react";

// noinspection ES6PreferShortImport
import {BaseCardRow, IBaseCardRowLayout} from '../BaseCardRow/BaseCardRow';

// noinspection ES6PreferShortImport
import {IBaseCardTabLayout} from './BaseCardTab';

export interface IBaseCardTabWithRows<T, ITEM> {
  key?: string;
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<T, ITEM>>;
  title: string;
}

// Don't use as <BaseCardTabWithRows/>. TabPane doesn't work in nested components of <Tabs/>
export const BaseCardTabWithRows: <T, ITEM>(props: IBaseCardTabWithRows<T, ITEM> & {
  sourceItem: T
  tabIndex: number,
  forceRenderTabs: boolean
}) => JSX.Element = props => (
  <Tabs.TabPane
    key={props.key ?? props.tabIndex.toString()}
    tab={<span>{props.title}</span>}
    forceRender={props.forceRenderTabs}
  >
    {wrapInArrayWithoutNulls(props.rows).map((row, index, arr) => (
      <BaseCardRow
        // eslint-disable-next-line react/no-array-index-key
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
