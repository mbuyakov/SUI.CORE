import { Icon } from '@ant-design/compatible';
import Tabs, { TabsProps } from 'antd/lib/tabs';
import * as React from 'react';

import { OneOrArrayWithNulls, wrapInArrayWithoutNulls } from '../typeWrappers';

import { IBaseCardRowLayout, renderIBaseCardRowLayout } from './BaseCardRowLayout';
import { BaseCardTabContext } from './BaseCardTabContext';

export interface IBaseCardTabLayout<T, ITEM> {
  icon?: string;
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<T, ITEM>>;
  title: string;
}

// tslint:disable-next-line:no-any
export function renderIBaseCardTabLayout<T, ITEM>(sourceItem: any, tab: IBaseCardTabLayout<T, ITEM>, tabIndex: number, forceRenderTabs: boolean): JSX.Element {
  return (
    <Tabs.TabPane key={tabIndex.toString()} tab={<span>{tab.icon && <Icon type={tab.icon}/>}{tab.title}</span>} forceRender={forceRenderTabs}>
      {wrapInArrayWithoutNulls(tab.rows).map((row, index, arr) => renderIBaseCardRowLayout(sourceItem, row, index, 'tab', arr.length))}
    </Tabs.TabPane>
  );
}

type ManagedTabsProps = Omit<TabsProps, 'onChange' | 'activeKey'>;

// tslint:disable-next-line:variable-name
const ManagedTabsInner: React.FC<ManagedTabsProps> = (props): JSX.Element => {
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

// tslint:disable-next-line:variable-name
export const ManagedTabs = ManagedTabsInner;
