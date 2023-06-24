import {ColumnInfo, ColumnInfoManager, getDataByKey, TableInfoManager} from "@sui/ui-old-core";

import {booleanRender, IBaseTableColLayout, SortingDirection} from '../BaseTable';
import {TableRenderSettingsPluginManager, TableRenderSettingsPopover} from '../TableRenderSettings';

import {IColumnInfoToBaseTableColProps} from './init';
import {generateCatalogDataPromise, getReferenceRenderColumnInfo} from './metaUtils';

export async function colToBaseTableCol(
  props: IColumnInfoToBaseTableColProps,
): Promise<IBaseTableColLayout> {
  const {columnInfo, rawMode, roles} = props;
  const columnName = columnInfo.getNameOrColumnName();

  const isJson = ["json", "json[]", "jsonb", "jsonb[]"].includes(columnInfo.columnType);

  const result: IBaseTableColLayout = {
    defaultGrouping: columnInfo.defaultGrouping,
    defaultSorting: columnInfo.defaultSorting as SortingDirection,
    defaultVisible: columnInfo.defaultVisible,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    groupingCriteria: (value: any) => value,
    id: columnInfo.columnName,
    subtotal: columnInfo.subtotalTypeBySubtotalTypeId,
    title: `${columnName}${rawMode ? ` (${columnInfo.columnName})` : ''}`,
    width: columnInfo.width,
    wordWrapEnabled: columnInfo.wordWrapEnabled,
    ...(isJson ? {groupingEnabled: false, sortingEnabled: false} : {}),
    // Костыль (имя для легкого поиска)
    ...{__SUI_columnInfo: columnInfo}
  };

  if (columnInfo.filterTypeByFilterTypeId) {
    result.search = {type: columnInfo.filterTypeByFilterTypeId.type};
  }

  const ref = getDataByKey(columnInfo, 'foreignColumnInfo', 'length')
    ? await ColumnInfoManager.getById(columnInfo!.foreignColumnInfo![0])
    : null;
  const foreignTableInfo = ref && (await TableInfoManager.getById(ref.tableInfoId));
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
          selectData: generateCatalogDataPromise(renderTableInfo.tableName, renderColumnInfo.columnName, !!foreignTableInfo?.isAlphabetSort),
          type: 'customSelect'
        };
      }

      result.subtotal = renderColumnInfo.subtotalTypeBySubtotalTypeId;
    }
  } else if (columnInfo.columnType && ['boolean', 'bit'].includes(columnInfo.columnType.toLowerCase())) {
    result.render = booleanRender;
    result.groupingCriteria = (value: boolean | number | null | undefined): string => value ? 'Истина' : 'Ложь';
  }

  // const metaInitProps = getMetaInitProps();

  const trp = TableRenderSettingsPopover.parseTableRenderParams(props.columnInfo.tableRenderParams);

  if (!props.rawMode) {
    let selectedPlugin = Array.from(TableRenderSettingsPluginManager.plugins.values()).find(plugin => plugin.extraActivationKostyl(result, renderColumnInfo, props, trp));

    if (!selectedPlugin && trp && trp.renderType) {
      selectedPlugin = TableRenderSettingsPluginManager.plugins.get(trp.renderType); // || new UnknownPlugin();
    }

    await selectedPlugin.baseTableColGenerator(result, renderColumnInfo, props, trp);

    result.tableRenderPlugin = selectedPlugin;
    result.tableRenderParams = trp;
  }

  // if (metaInitProps && metaInitProps.baseTableColLayoutGenerateHelper) {
  //   await metaInitProps.baseTableColLayoutGenerateHelper(result, renderColumnInfo, props);
  // }

  return result;
}
