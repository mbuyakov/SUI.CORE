import {booleanRender, IBaseTableColLayout, SortingDirection} from "@smsoft/sui-base-components";
import {
  capitalize,
  getDataByKey
} from '@smsoft/sui-core';
import camelCase from 'lodash/camelCase';
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as React from "react";

import {ColumnInfo, ColumnInfoManager, TableInfoManager} from "../cache";

import {getMetaInitProps, IColumnInfoToBaseTableColProps} from "./init";
import {generateCatalogDataPromise, getReferenceRenderColumnInfo} from "./metaUtils";

export async function colToBaseTableCol(
  props: IColumnInfoToBaseTableColProps
): Promise<IBaseTableColLayout> {
  const {columnInfo, rawMode, roles} = props;
  const columnName = await columnInfo.getNameOrColumnName();

  const result: IBaseTableColLayout = {
    defaultGrouping: columnInfo.defaultGrouping,
    defaultSorting: columnInfo.defaultSorting as SortingDirection,
    defaultVisible: columnInfo.defaultVisible,
    // tslint:disable-next-line:no-any
    groupingCriteria: (value: any) => value,
    id: camelCase(columnInfo.columnName),
    subtotal: columnInfo.subtotalTypeBySubtotalTypeId,
    title:  `${columnName}${rawMode ? ` (${columnInfo.columnName})` : ""}`,
    width: columnInfo.width,
  };

  const ref = getDataByKey(columnInfo, "foreignColumnInfo", "length")
    ? await ColumnInfoManager.getById(columnInfo!.foreignColumnInfo![0])
    : null;
  const foreignTableInfo = ref && await TableInfoManager.getById(ref.tableInfoId);
  let renderColumnInfo: ColumnInfo | null = null;

  if (!rawMode && foreignTableInfo) {
    renderColumnInfo = await getReferenceRenderColumnInfo(foreignTableInfo, roles);

    if (renderColumnInfo) {
      const renderTableInfo = await TableInfoManager.getById(renderColumnInfo.tableInfoId);

      result.dataKey = [
        `${camelCase(renderTableInfo.tableName)}By${capitalize(camelCase(columnInfo.columnName))}`,
        camelCase(renderColumnInfo.columnName),
      ];

      if (foreignTableInfo.isCatalog) {
        result.search = {
          selectData: generateCatalogDataPromise(
            renderTableInfo.tableName,
            renderColumnInfo.columnName
          ),
          type: 'customSelect',
        };
      }

      result.subtotal = renderColumnInfo.subtotalTypeBySubtotalTypeId;
    }
  } else if (columnInfo.columnType && ['boolean', 'bit'].includes(columnInfo.columnType.toLowerCase())) {
    result.render = booleanRender;
    result.groupingCriteria = (value: boolean | number | null | undefined) => value ? 'Истина' : 'Ложь';
  }

  const metaInitProps = getMetaInitProps();

  if (metaInitProps && metaInitProps.baseTableColLayoutGenerateHelper) {
    await metaInitProps.baseTableColLayoutGenerateHelper(result, renderColumnInfo, props);
  }

  if (!result.search && columnInfo.filterTypeByFilterTypeId) {
    result.search = {type: columnInfo.filterTypeByFilterTypeId.type};
  }

  return result;
}