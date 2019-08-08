import {Omit, OneOrArrayWithNulls, wrapInArrayWithoutNulls} from '@smsoft/sui-core';
import Icon from 'antd/lib/icon';
import Tabs from 'antd/lib/tabs';
import * as React from 'react';

import { IBaseCardRowLayout, IBaseFormRowLayout, renderIBaseCardRowLayout } from './BaseCardRowLayout';

export interface IBaseCardTabLayout<T> {
  icon?: string;
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<T>>;
  title: string;
}

export type IBaseFormTabLayout<T> = Omit<IBaseCardTabLayout<T>, 'rows'> & {
  rows: OneOrArrayWithNulls<IBaseFormRowLayout<T>>
}

// tslint:disable-next-line:no-any
export function renderIBaseCardTabLayout<T>(sourceItem: any, tab: IBaseCardTabLayout<T> | IBaseFormTabLayout<T>, tabIndex: number): JSX.Element {
  return (
    <Tabs.TabPane key={tabIndex.toString()} tab={<span>{tab.icon && <Icon type={tab.icon}/>}{tab.title}</span>} forceRender={true}>
      {wrapInArrayWithoutNulls(tab.rows).map((row, index, arr) => renderIBaseCardRowLayout(sourceItem, row, index, 'tab', arr.length))}
    </Tabs.TabPane>
  );
}
