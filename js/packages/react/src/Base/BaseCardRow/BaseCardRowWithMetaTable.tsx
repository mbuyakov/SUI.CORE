/* eslint-disable @typescript-eslint/ban-types */
import React from "react";
import {BackendTable} from "@/BackendTable";
import {addQuotesIfString, getDataByKey} from "@sui/core";
import {BaseCardRowParent} from '@/Base/BaseCardRow/types';
import {IBaseCardRowLayout} from "@/Base/BaseCardRow/BaseCardRow";


// It's BACKEND props. Mark as MetaTableProps for backward computability in RN
export interface IMetaTableProps {
  filter?: object | string;
  globalFilter?: object | string;
  table: string;
  titleEnabled?: boolean;
}

export interface IBaseCardRowWithMetaTableLayout {
  metaTableProps: IMetaTableProps;
}

export const DATA_KEY_REGEXP = /@([a-zA-z0-9|]+)/g;

export function mapFilters<T>(filters: string, sourceItem: T): string | null {
  let result = filters;

  // noinspection SuspiciousTypeOfGuard
  if (typeof result === 'string') {
    result = result.replace(DATA_KEY_REGEXP, (_, key) => {
      const dataKey = key.split('|');
      let data = getDataByKey(sourceItem, dataKey);
      if (Array.isArray(data)) {
        data = data.map(addQuotesIfString);
      }

      return addQuotesIfString(data);
    });

    result = result.replace(/([A-Za-z0-9]+)\s*:/g, (_, key) => `"${key.trim()}":`);
  }

  return result || null;
}

export const BaseCardRowWithMetaTable: <T>(props: IBaseCardRowWithMetaTableLayout & {
  rowIndex: number,
  rowsLength: number,
  parent: BaseCardRowParent,
  sourceItem: T
}) => JSX.Element = props => (
  <BackendTable
    cardType="inner"
    {...props.metaTableProps}
    paperStyle={props.rowIndex !== 0 || props.rowsLength !== 1 ? {marginLeft: 0, marginRight: 0} : {}}
    fitToCardBody={(props.parent === 'card' || props.parent === 'block') && props.rowIndex === 0 && props.rowsLength === 1}
    fitToCollapseBody={props.parent === 'collapse' && props.rowIndex === 0 && props.rowsLength === 1}
    filter={JSON.parse(mapFilters(props.metaTableProps.globalFilter as string, props.sourceItem))}
    defaultFilter={JSON.parse(mapFilters(props.metaTableProps.filter as string, props.sourceItem))}
  />
);

export function isRowWithMetaTable<T,ITEM>(row: IBaseCardRowLayout<T, ITEM>): row is IBaseCardRowWithMetaTableLayout {
  return "metaTableProps" in row;
}
