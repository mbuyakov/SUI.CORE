import Tabs, {TabsProps} from 'antd/lib/tabs';
import * as React from 'react';
import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from '@sui/core';
import {BaseCardRow, IBaseCardRowLayout} from "@/Base/BaseCardRow";

import {BaseCardTabContext} from './BaseCardTabContext';

export interface IBaseCardTabLayout<T, ITEM> {
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<T, ITEM>>;
  title: string;
}

export function renderIBaseCardTabLayout<T, ITEM>(sourceItem: T, tab: IBaseCardTabLayout<T, ITEM>, tabIndex: number, forceRenderTabs: boolean): JSX.Element {
  return (
    <Tabs.TabPane key={tabIndex.toString()} tab={<span>{tab.title}</span>} forceRender={forceRenderTabs}>
      {wrapInArrayWithoutNulls(tab.rows).map((row, index, arr) => (
        <BaseCardRow
          sourceItem={sourceItem}
          row={row}
          rowIndex={index}
          parent="tab"
          rowsLength={arr.length}
        />
      ))}
    </Tabs.TabPane>
  );
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
