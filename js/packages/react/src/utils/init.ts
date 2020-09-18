import * as React from 'react';
import IdleTimer from 'react-idle-timer';
import {ColumnInfo, TableInfo} from "@sui/core";


export interface IColumnInfoToBaseTableColProps {
  columnInfo: ColumnInfo;
  isLinkCol?: boolean;
  rawMode?: boolean;
  roles: string[]; // TODO: roles - быстрый фикс, продумать в будущем
  tableInfo: TableInfo;
}

export const IDLE_TIMER_REF = React.createRef<IdleTimer>();
