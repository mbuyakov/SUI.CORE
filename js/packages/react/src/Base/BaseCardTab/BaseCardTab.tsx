import Tabs, {TabsProps} from 'antd/lib/tabs';
import * as React from 'react';

import {BaseCardTabContext} from '@/Base/BaseCardTab/BaseCardTabContext';
import {BaseCardTabWithBlocks, IBaseCardTabWithBlocks, isTabWithBlocks} from "@/Base/BaseCardTab/BaseCardTabWithBlocks";
import {BaseCardTabWithRows, IBaseCardTabWithRows, isTabWithRows} from "@/Base/BaseCardTab/BaseCardTabWithRows";


export type IBaseCardTabLayout<T, ITEM> =
  IBaseCardTabWithRows<T, ITEM> |
  IBaseCardTabWithBlocks<T, ITEM>;

export function renderIBaseCardTabLayout<T, ITEM>(sourceItem: T, tab: IBaseCardTabLayout<T, ITEM>, tabIndex: number, forceRenderTabs: boolean): JSX.Element {
    if(isTabWithRows(tab)) {
      return (
        <BaseCardTabWithRows
          {...tab}
          key={tabIndex.toString()}
          sourceItem={sourceItem}
          tabIndex={tabIndex}
          forceRenderTabs={forceRenderTabs}
        />
      );
    } else if (isTabWithBlocks(tab)) {
      return (
        <BaseCardTabWithBlocks
          {...tab}
          key={tabIndex.toString()}
          sourceItem={sourceItem}
          tabIndex={tabIndex}
          forceRenderTabs={forceRenderTabs}
        />
      );
    } else {
      return (<h3>UNKNOWN TAB TYPE</h3>);
    }
}

type ManagedTabsProps = Omit<TabsProps, 'onChange' | 'activeKey'>;

const ManagedTabsInner: React.FC<ManagedTabsProps> = props => {
  const [activeTab, setTab] = React.useState(props.defaultActiveKey);

  return (
    <BaseCardTabContext.Provider value={setTab}>
      <Tabs
        {...props}
        activeKey={activeTab}
        onChange={setTab}
      />
    </BaseCardTabContext.Provider>
  );
};

export const ManagedTabs = ManagedTabsInner;
