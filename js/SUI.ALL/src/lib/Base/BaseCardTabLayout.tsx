import Icon from 'antd/lib/icon';
import Tabs, { TabsProps } from 'antd/lib/tabs';
import * as React from 'react';

import { OneOrArrayWithNulls, wrapInArrayWithoutNulls } from '../typeWrappers';

import { IBaseCardRowLayout, IBaseFormRowLayout, renderIBaseCardRowLayout } from './BaseCardRowLayout';
import { BaseCardTabContext } from './BaseCardTabContext';

export interface IBaseCardTabLayout<T> {
  icon?: string;
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<T>>;
  title: string;
}

export type IBaseFormTabLayout<FIELDS extends string> = Omit<IBaseCardTabLayout<never>, 'rows'> & {
  rows: OneOrArrayWithNulls<IBaseFormRowLayout<FIELDS>>
}

// tslint:disable-next-line:no-any
export function renderIBaseCardTabLayout<T>(sourceItem: any, tab: IBaseCardTabLayout<T> | IBaseFormTabLayout<string>, tabIndex: number, forceRenderTabs: boolean): JSX.Element {
  return (
    <Tabs.TabPane key={tabIndex.toString()} tab={<span>{tab.icon && <Icon type={tab.icon}/>}{tab.title}</span>} forceRender={forceRenderTabs}>
      {wrapInArrayWithoutNulls(tab.rows as OneOrArrayWithNulls<IBaseCardRowLayout<T> | IBaseFormRowLayout<string>>).map((row, index, arr) => renderIBaseCardRowLayout(sourceItem, row, index, 'tab', arr.length))}
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
