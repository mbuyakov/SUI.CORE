/* tslint:disable:no-any */
import React from 'react';

import { BASE_CARD_COLS } from '../styles';
import { OneOrArrayWithNulls, wrapInArrayWithoutNulls } from '../typeWrappers';

import { IBaseCardItemLayout, renderIBaseCardItem } from './BaseCardItemLayout';
import { IBaseFormItemLayout, renderIBaseFormItemLayout } from './BaseFormItemLayout';

export interface IBaseCardColLayout<T> {
  colspan?: number;
  items: OneOrArrayWithNulls<IBaseCardItemLayout<T>>;
  title?: string;
}

export type IBaseFormColLayout<T> = Omit<IBaseCardColLayout<T>, 'items'> & {
  items: OneOrArrayWithNulls<IBaseFormItemLayout>
}

export function renderIBaseCardColsLayout<T>(sourceItem: any, cols: Array<IBaseCardColLayout<T> | IBaseFormColLayout<T>>): JSX.Element {
  const anyHasTitle = cols.some(col => col.title);
  const maxRows = Math.max(...cols.map(col => wrapInArrayWithoutNulls<any>(col.items).length));
  const rows: JSX.Element[] = [];

  for (let curRowIndex = 0; curRowIndex < maxRows; curRowIndex++) {
    const itemsInRow: React.ReactNode[] = [];

    // tslint:disable-next-line:prefer-for-of
    for (let colIndex = 0; colIndex < cols.length; colIndex++) {
      const col = cols[colIndex];
      const colspan = col.colspan || 1;
      const item = wrapInArrayWithoutNulls<IBaseCardItemLayout<T> | IBaseFormItemLayout>(col.items)[curRowIndex];
      // console.log(cols, item);
      itemsInRow.push(item ? ((item as IBaseFormItemLayout).fieldName ? renderIBaseFormItemLayout(item as IBaseFormItemLayout, colspan) : renderIBaseCardItem(sourceItem, item, colspan)) : (<td colSpan={2}/>));
    }

    rows.push(
      <tr>
        {itemsInRow}
      </tr>,
    );
  }

  return (
    <table className={BASE_CARD_COLS}>
      {anyHasTitle && (
        <thead>
        <tr>
          {cols.map(col => (<><th style={{color: "rgba(0, 0, 0, 0.65)"}}>{col.title}</th><th /></>))}
        </tr>
        </thead>
      )}
      <tbody>
      {rows}
      </tbody>
    </table>
  );
}
