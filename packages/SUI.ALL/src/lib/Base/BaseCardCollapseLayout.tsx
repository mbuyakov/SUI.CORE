import Collapse from 'antd/lib/collapse';
import * as React from 'react';

import {COLLAPSE_PANEL_NO_PADDING} from "../styles";
import { defaultIfNotBoolean, OneOrArrayWithNulls, wrapInArrayWithoutNulls } from '../typeWrappers';

import { IBaseCardRowLayout, IBaseFormRowLayout, renderIBaseCardRowLayout } from './BaseCardRowLayout';

export interface IBaseCardCollapseLayout<T> {
  defaultOpened?: boolean;
  padding?: boolean;
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<T>>;
  title: string;
}

export type IBaseFormCollapseLayout<T> = Omit<IBaseCardCollapseLayout<T>, 'rows'> & {
  rows: OneOrArrayWithNulls<IBaseFormRowLayout<T>>
}

// tslint:disable-next-line:no-any
export function renderIBaseCardCollapseLayout<T>(sourceItem: any, panel: IBaseCardCollapseLayout<T> | IBaseFormCollapseLayout<T>, index: number, fitCollapsePanel: boolean, rowsCount: number): JSX.Element {
  const padding = defaultIfNotBoolean(panel.padding, true);

  return (
    <Collapse.Panel
      style={{
        borderRadius: fitCollapsePanel && rowsCount === 1 ? 0 : undefined,
      }}
      key={index.toString()}
      header={panel.title}
      className={padding ? "" : COLLAPSE_PANEL_NO_PADDING}
    >
      {wrapInArrayWithoutNulls(panel.rows).map((row, rowIndex, arr) => renderIBaseCardRowLayout(sourceItem, row, rowIndex, 'collapse', arr.length))}
    </Collapse.Panel>
  );
}
