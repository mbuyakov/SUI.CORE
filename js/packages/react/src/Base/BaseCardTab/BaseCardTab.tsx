import * as React from 'react';
import {BaseCardTabWithBlocks, IBaseCardTabWithBlocks, isTabWithBlocks} from "@/Base/BaseCardTab/BaseCardTabWithBlocks";
import {BaseCardTabWithRows, IBaseCardTabWithRows, isTabWithRows} from "@/Base/BaseCardTab/BaseCardTabWithRows";


export type IBaseCardTabLayout<T, ITEM> =
  IBaseCardTabWithRows<T, ITEM> |
  IBaseCardTabWithBlocks<T, ITEM>;

export function renderIBaseCardTabLayout<T, ITEM>(sourceItem: T, tab: IBaseCardTabLayout<T, ITEM>, tabIndex: number, forceRenderTabs: boolean): JSX.Element {
  if (isTabWithRows(tab)) {
    return (
      BaseCardTabWithRows({
        ...tab,
        sourceItem,
        tabIndex,
        forceRenderTabs
      })
    );
  } else if (isTabWithBlocks(tab)) {
    return (
      BaseCardTabWithBlocks({
        ...tab,
        sourceItem,
        tabIndex,
        forceRenderTabs
      })
    );
  } else {
    return (<h3>UNKNOWN TAB TYPE</h3>);
  }
}