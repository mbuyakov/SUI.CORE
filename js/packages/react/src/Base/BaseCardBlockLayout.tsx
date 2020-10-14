import * as React from 'react';
import {Card} from 'antd';
import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from '@sui/core';
import {BaseCardRow, IBaseCardRowLayout} from "@/Base/BaseCardRow";

export interface IBaseCardBlockLayout<T, ITEM> {
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<T, ITEM>>;
  title: string;
}

export const BaseCardBlock: <T, ITEM>(props: IBaseCardBlockLayout<T, ITEM> & {
  sourceItem: T
}) => JSX.Element = props => (
  <Card title={props.title} style={{margin: "12px, 0"}}>
    {wrapInArrayWithoutNulls(props.rows).map((row, index, arr) => (
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

