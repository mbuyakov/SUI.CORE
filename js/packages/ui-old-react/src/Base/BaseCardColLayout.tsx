/* eslint-disable @typescript-eslint/no-explicit-any */
import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from "@sui/ui-old-core";
import React from "react";

// noinspection ES6PreferShortImport
import {BASE_CARD_COL_TITLE, BASE_CARD_COLS} from "../styles";

import {BaseCardContext} from "./BaseCardContext";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface IBaseCardColLayout<T, ITEM> {
  colspan?: number;
  items: OneOrArrayWithNulls<ITEM>;
  title?: string;
  wideTitle?: boolean;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function renderIBaseCardColsLayout<T, ITEM>(sourceItem: any, cols: Array<IBaseCardColLayout<T, ITEM>>): JSX.Element {
  const anyHasTitle = cols.some(col => col.title);
  const maxRows = Math.max(...cols.map(col => wrapInArrayWithoutNulls<any>(col.items).length));
  const rows: JSX.Element[] = [];

  for (let curRowIndex = 0; curRowIndex < maxRows; curRowIndex++) {
    const itemsInRow: React.ReactNode[] = [];

    for (let colIndex = 0; colIndex < cols.length; colIndex++) {
      const col = cols[colIndex];
      const colspan = col.colspan || 1;
      const item = wrapInArrayWithoutNulls(col.items)[curRowIndex];
      // console.log(cols, item);
      itemsInRow.push(
        item
          ? (<BaseCardContext.Consumer>{({itemRenderer}): React.ReactNode => (itemRenderer(sourceItem, item, colspan))}</BaseCardContext.Consumer>)
          : (<td colSpan={2}/>)
      );
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
          {cols.map(col => (<>
            <th className={BASE_CARD_COL_TITLE} colSpan={col.wideTitle ? 2 : 1}>{col.title}</th>
            {!col.wideTitle && <th/>}
          </>))}
        </tr>
        </thead>
      )}
      <tbody>
      {rows}
      </tbody>
    </table>
  );
}
