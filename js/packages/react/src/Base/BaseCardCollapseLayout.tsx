import Collapse from 'antd/lib/collapse';
import * as React from 'react';

import { defaultIfNotBoolean, OneOrArrayWithNulls, wrapInArrayWithoutNulls } from '@sui/core';
import {BaseCardRow, IBaseCardRowLayout} from "@/Base/BaseCardRow";
import {COLLAPSE_PANEL_NO_PADDING} from "@/styles";


export interface IBaseCardCollapseLayout<T, ITEM> {
  defaultOpened?: boolean;
  padding?: boolean;
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<T, ITEM>>;
  title: string;
}

export function renderIBaseCardCollapseLayout<T, ITEM>(sourceItem: T, panel: IBaseCardCollapseLayout<T, ITEM>, index: number, fitCollapsePanel: boolean, rowsCount: number): JSX.Element {
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
      {wrapInArrayWithoutNulls(panel.rows).map((row, rowIndex, arr) => (
        <BaseCardRow
          sourceItem={sourceItem}
          row={row}
          rowIndex={rowIndex}
          parent="collapse"
          rowsLength={arr.length}
        />
      ))}
    </Collapse.Panel>
  );
}
