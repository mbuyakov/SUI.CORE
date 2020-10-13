import * as React from 'react';

import {BaseCardRowWithDivider, IBaseCardRowWithDividerLayout, isRowWithDivider} from "@/Base/BaseCardRow/BaseCardRowWithDivider";
import {BaseCardRowWithTabs, IBaseCardRowWithTabsLayout, isRowWithTabs} from '@/Base/BaseCardRow/BaseCardRowWithTabs';
import {BaseCardRowWithMetaTable, IBaseCardRowWithMetaTableLayout, isRowWithMetaTable} from '@/Base/BaseCardRow/BaseCardRowWithMetaTable';
import {BaseCardRowWithCollapse, IBaseCardRowWithCollapseLayout, isRowWithCollapse} from "@/Base/BaseCardRow/BaseCardRowWithCollapse";
import {BaseCardRowWithCols, IBaseCardRowWithColsLayout, isRowWithCols} from "@/Base/BaseCardRow/BaseCardRowWithCols";

export type IBaseCardRowLayout<T, ITEM> =
  IBaseCardRowWithColsLayout<T, ITEM> |
  IBaseCardRowWithCollapseLayout<T, ITEM> |
  IBaseCardRowWithDividerLayout |
  IBaseCardRowWithMetaTableLayout |
  IBaseCardRowWithTabsLayout<T, ITEM>;

// @ts-ignore
export const BaseCardRow: <T, ITEM>(props: {
  sourceItem: T,
  row: IBaseCardRowLayout<T, ITEM>,
  rowIndex: number, parent: 'card' | 'collapse' | 'tab',
  rowsLength: number,
}) => JSX.Element = props => {
  const row = props.row;
  if (isRowWithDivider(row)) {
    return (
      <BaseCardRowWithDivider
        {...row}
      />
    );
  } else if (isRowWithTabs(row)) {
    return (
      <BaseCardRowWithTabs
        {...row}
        sourceItem={props.sourceItem}
      />
    );
  } else if (isRowWithMetaTable(row)) {
    return (
      <BaseCardRowWithMetaTable
        {...row}
        rowIndex={props.rowIndex}
        rowsLength={props.rowsLength}
        parent={props.parent}
        sourceItem={props.rowsLength}
      />
    )
  } else if (isRowWithCollapse(row)) {
    return (
      <BaseCardRowWithCollapse
        {...row}
        rowIndex={props.rowIndex}
        rowsLength={props.rowsLength}
        sourceItem={props.sourceItem}
      />
    );
  } else if (isRowWithCols(row)) {
    return <BaseCardRowWithCols
      {...row}
      sourceItem={props.sourceItem}
    />;
  } else {
    return (<h3>UNKNOWN ROW TYPE</h3>);
  }
}
