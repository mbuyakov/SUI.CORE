import * as React from 'react';
import {Card} from 'antd';
import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from '@sui/core';
import {BaseCardRow, IBaseCardRowLayout, isRowWithCollapse} from "@/Base/BaseCardRow";

export interface IBaseCardBlockLayout<T, ITEM> {
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<T, ITEM>>;
  title?: React.ReactNode;
}

export const BaseCardBlock: <T, ITEM>(props: IBaseCardBlockLayout<T, ITEM> & {
  sourceItem: T
}) => JSX.Element = props => {
  const rows = wrapInArrayWithoutNulls(props.rows);
  const noPadding = rows.length == 1 && isRowWithCollapse(rows[0]); // If block have only collapsePanels - disable padding
  return (
    <Card title={props.title} style={{margin: "12px 0"}} bodyStyle={noPadding ? {padding: 0} : {}}>
      {rows.map((row, index, arr) => (
        <BaseCardRow
          key={index.toString()}
          sourceItem={props.sourceItem}
          row={row}
          rowIndex={index}
          parent="block"
          rowsLength={arr.length}
        />
      ))}
    </Card>
  );
}

