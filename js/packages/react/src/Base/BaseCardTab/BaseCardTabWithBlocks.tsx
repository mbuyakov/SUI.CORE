import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from "@sui/core";
import * as React from "react";
import {Tabs} from "antd";
import {BaseCardBlock, IBaseCardBlockLayout} from "@/Base/BaseCardBlockLayout";
import {IBaseCardTabLayout} from "@/Base/BaseCardTab/BaseCardTab"

export interface IBaseCardTabWithBlocks<T, ITEM> {
  key?: string;
  blocks: OneOrArrayWithNulls<IBaseCardBlockLayout<T, ITEM>>;
  title: string;
}

// Don't use as <BaseCardTabWithRows/>. TabPane doesn't work in nested components of <Tabs/>
export const BaseCardTabWithBlocks: <T, ITEM>(props: IBaseCardTabWithBlocks<T, ITEM> & {
  sourceItem: T
  tabIndex: number,
  forceRenderTabs: boolean
}) => JSX.Element = props => (
  <Tabs.TabPane
    key={props.key ?? props.tabIndex.toString()}
    tab={<span>{props.title}</span>}
    forceRender={props.forceRenderTabs}
  >
    {wrapInArrayWithoutNulls(props.blocks).map((block, index) => (
      <BaseCardBlock
        {...block}
        key={index.toString()}
        sourceItem={props.sourceItem}
      />
    ))}
  </Tabs.TabPane>
);

export function isTabWithBlocks<T, ITEM>(tab: IBaseCardTabLayout<T, ITEM>): tab is IBaseCardTabWithBlocks<T, ITEM> {
  return "blocks" in tab;
}
