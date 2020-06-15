import * as React from 'react';

import { booleanRender, IBaseTableColLayout, SortingDirection } from '../BaseTable';
import { ColumnInfo, ColumnInfoManager, TableInfoManager } from '../cache';
import { getDataByKey } from '../dataKey';
import { TableRenderSettingsPluginManager, TableRenderSettingsPopover } from '../TableRenderSettings';

import { IColumnInfoToBaseTableColProps } from './init';
import { generateCatalogDataPromise, getReferenceRenderColumnInfo } from './metaUtils';

export async function colToBaseTableCol(
  props: IColumnInfoToBaseTableColProps,
): Promise<IBaseTableColLayout> {
  const { columnInfo, rawMode, roles } = props;
  const columnName = columnInfo.getNameOrColumnName();

  const result: IBaseTableColLayout = {
    defaultGrouping: columnInfo.defaultGrouping,
    defaultSorting: columnInfo.defaultSorting as SortingDirection,
    defaultVisible: columnInfo.defaultVisible,
groupingCriteria: (value: any) => value,
    id: columnInfo.columnName,
    subtotal: columnInfo.subtotalTypeBySubtotalTypeId,
    title: `${columnName}${rawMode ? ` (${columnInfo.columnName})` : ''}`,
    width: columnInfo.width,
    wordWrapEnabled: columnInfo.wordWrapEnabled,
    // Костыль (имя для легкого поиска)
    ...{__SUI_columnInfo: columnInfo}
  };

  if (columnInfo.filterTypeByFilterTypeId) {
    result.search = { type: columnInfo.filterTypeByFilterTypeId.type };
  }

  const ref = getDataByKey(columnInfo, 'foreignColumnInfo', 'length')
    ? await ColumnInfoManager.getById(columnInfo!.foreignColumnInfo![0])
    : null;
  const foreignTableInfo = ref && await TableInfoManager.getById(ref.tableInfoId);
  let renderColumnInfo: ColumnInfo | null = null;

  if (!rawMode && foreignTableInfo) {
    renderColumnInfo = await getReferenceRenderColumnInfo(foreignTableInfo, roles);

    if (renderColumnInfo) {
      const renderTableInfo = await TableInfoManager.getById(renderColumnInfo.tableInfoId);

      result.dataKey = [
        `${renderTableInfo.tableName}_by_${columnInfo.columnName}`,
        renderColumnInfo.columnName,
      ];

      if (foreignTableInfo.isCatalog) {
        result.search = {
          multiple: result.search && result.search.type === "multiple",
          selectData: generateCatalogDataPromise(
            renderTableInfo.tableName,
            renderColumnInfo.columnName,
          ),
          type: 'customSelect'
        };
      }

      result.subtotal = renderColumnInfo.subtotalTypeBySubtotalTypeId;
    }
  } else if (columnInfo.columnType && ['boolean', 'bit'].includes(columnInfo.columnType.toLowerCase())) {
    result.render = booleanRender;
    result.groupingCriteria = (value: boolean | number | null | undefined) => value ? 'Истина' : 'Ложь';
  }

  // const metaInitProps = getMetaInitProps();

  const trp = TableRenderSettingsPopover.parseTableRenderParams(props.columnInfo.tableRenderParams);

  if (!props.rawMode) {
// @ts-ignore
    let selectedPlugin = Array.from(TableRenderSettingsPluginManager.plugins.values()).find(plugin => plugin.extraActivationKostyl(result, renderColumnInfo, props, trp));

    if (!selectedPlugin && trp && trp.renderType) {
      selectedPlugin = TableRenderSettingsPluginManager.plugins.get(trp.renderType); // || new UnknownPlugin();
    }

// @ts-ignore
    await selectedPlugin.baseTableColGenerator(result, renderColumnInfo, props, trp);

// @ts-ignore
    result.__tableRenderParams = trp; // Костыль для округления подытогов
  }

  // if (metaInitProps && metaInitProps.baseTableColLayoutGenerateHelper) {
  //   await metaInitProps.baseTableColLayoutGenerateHelper(result, renderColumnInfo, props);
  // }

  return result;
}
