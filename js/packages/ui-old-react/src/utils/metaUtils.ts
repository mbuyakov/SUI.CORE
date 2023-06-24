/* eslint-disable @typescript-eslint/no-explicit-any */
import {addPluralEnding, camelCase, capitalize, ColumnInfo, ColumnInfoManager, DataKey, dataKeysToDataTree, getDataByKey, getSUISettings, IGqlFilter, IObjectWithIndex, IRawRoute, query, removePluralEnding, RouteType, stringifyGqlFilter, TableInfo, TableInfoManager, wrapInArray} from "@sui/ui-old-core";

// noinspection ES6PreferShortImport
import {SelectData} from '../BaseTable';

import {ActionType, isNumberAction} from './actionType';
import {FilterType} from './filterType';


export interface IRouteLink {
  entity: string;
  path: string;
  type: RouteType;
}

export const routeLinks: IRouteLink[] = [];

/**
 * Generate route links from raw route data
 */
export function parseRoutes(routes: IRawRoute[]): IRouteLink[] {
  routes.forEach(route => {
    if (route.cardForEntity) {
      route.cardForEntity.forEach(entity => {
        routeLinks.push({
          entity: camelCase(entity),
          path: route.path,
          type: 'card',
        });
      });
    }
    if (route.tableForEntity) {
      route.tableForEntity.forEach(entity => {
        routeLinks.push({
          entity: camelCase(entity),
          path: route.path,
          type: 'table',
        });
      });
    }
    if (route.routes) {
      parseRoutes(route.routes);
    }
  });

  return routeLinks;
}

export function getLinkForTable(
  tableName: string,
  type: RouteType,
  id?: string | number,
): string | null {
  const link = routeLinks.find(value => value.type === type && value.entity === camelCase(tableName));
  if (link) {
    return id ? link.path.replace(':id', id.toString()) : link.path;
  }

  const metaInitProps = getSUISettings();

  return (metaInitProps && metaInitProps.defaultGetLinkForTable)
    ? metaInitProps.defaultGetLinkForTable(tableName, type, id)
    : null;
}

export async function generateCatalogDataPromise(
  tableName: string,
  titleColumnName: string,
  isAlphabetSort: boolean
): Promise<SelectData> {
  const titleColumn = titleColumnName ? camelCase(titleColumnName) : "id";

  const queryData = await query<IObjectWithIndex[]>(
    `{
      all${capitalize(camelCase(addPluralEnding(tableName)))} {
        nodes {
          id
          ${titleColumn}
        }
      }
    }`,
    2
  );

  const catalogData = queryData.map((it) => ({title: it[titleColumn], value: it.id}));

  return isAlphabetSort
    ? catalogData.sort((a, b) => a.title.localeCompare(b.title))
    : catalogData
}

export function formatObjectName(objectName: string, pascalCase: boolean = false): string {
  return pascalCase ? objectName : camelCase(capitalize(removePluralEnding(objectName)));
}

export async function getAllowedColumnInfos(tableInfo: TableInfo, roles: string[]): Promise<ColumnInfo[]> {
  return (await tableInfo.getColumns())
    .filter(col => isAllowedColumnInfo(col, roles))
    .sort((a, b): number => (a.order || 0) - (b.order || 0));
}

export function isAllowedColumnInfo(columnInfo: ColumnInfo, roles: string[]): boolean {
  return columnInfo.visible
    && (getSUISettings().ignoreColumnRoleRestriction || roles.some(role => columnInfo.roles.includes(role)));
}

export async function getReferenceRenderColumnInfo(
  tableInfo: TableInfo,
  roles: string[],
): Promise<ColumnInfo | null> {
  return __getReferenceRenderColumnInfo(tableInfo, roles, []);
}

async function __getReferenceRenderColumnInfo(
  tableInfo: TableInfo,
  roles: string[],
  visitedTableInfoIds: string[],
): Promise<ColumnInfo | null> {
  if (!visitedTableInfoIds.includes(tableInfo.id)) {
    visitedTableInfoIds.push(tableInfo.id);
  } else {
    throw new Error(`Поле ссылки из другого объекта с id = ${tableInfo.id} рекурсивно ссылается сам на себя (см. foreign_column_info)`);
  }

  const foreignLinkColumnInfo = tableInfo
    && tableInfo.foreignLinkColumnInfoId
    && (await ColumnInfoManager.getById(tableInfo.foreignLinkColumnInfoId));

  if (foreignLinkColumnInfo) {
    const referencedTableInfo = await getReferencedTableInfo(foreignLinkColumnInfo);
    const forwardReferencedForeignLinkColumnInfo = referencedTableInfo && (await __getReferenceRenderColumnInfo(referencedTableInfo, roles, visitedTableInfoIds));

    if (forwardReferencedForeignLinkColumnInfo != null) {
      return forwardReferencedForeignLinkColumnInfo;
    }
    if (isAllowedColumnInfo(foreignLinkColumnInfo, roles) && foreignLinkColumnInfo.columnName !== 'id') {
      return foreignLinkColumnInfo;
    }
  }

  return null;
}

export function toConnectionName(tableInfo: TableInfo, parentTableInfo?: TableInfo): string {
  const camelCasedTableName = camelCase(tableInfo.tableName);

  return parentTableInfo
    ? `${addPluralEnding(camelCasedTableName)}By${capitalize(camelCase(parentTableInfo.tableName))}Id`
    : `all${capitalize(addPluralEnding(camelCasedTableName))}`;
}

export interface IDataSet<T = any> {
  children?: IDataSet[];
  id: string | number;
  value?: T;
}

export function getDataSetRender(dataSet: IDataSet): string {
  return dataSet.hasOwnProperty('value')
    ? (dataSet.value != null ? String(dataSet.value) : dataSet.value)
    : dataSet.id;
}

function __queryFilterString<T>(filter?: IGqlFilter<T>): string {
  return filter
    ? `(${stringifyGqlFilter({filter})})`
    : '';
}

// eslint-disable-next-line @typescript-eslint/ban-types
export async function getDataSet<TValueType = {}, TGroupType = {}>(
  roles: string[],
  valueTableInfo: TableInfo,
  groupTableInfo?: TableInfo,
  valueTableInfoFilter?: IGqlFilter<TValueType>,
  groupTableInfoFilter?: IGqlFilter<TGroupType>,
): Promise<IDataSet[]> {
  const queryDataKeys: DataKey[] = [];
  let groupRenderDataKey = null;
  const valuePrefixDataKey: DataKey = [];
  const groupPrefixDataKey: DataKey = [];

  if (groupTableInfo) {
    // ${__queryFilterString(groupTableInfoFilter)}
    groupPrefixDataKey.push(toConnectionName(groupTableInfo), 'nodes');
    queryDataKeys.push(groupPrefixDataKey.concat(['id']));

    groupRenderDataKey = await generateRenderDataKey(groupTableInfo, roles);
    if (groupRenderDataKey) {
      queryDataKeys.push(groupPrefixDataKey.concat(groupRenderDataKey));
    }

    valuePrefixDataKey.push(
      ...groupPrefixDataKey,
      toConnectionName(valueTableInfo, groupTableInfo),
    );
  } else {
    valuePrefixDataKey.push(toConnectionName(valueTableInfo));
  }

  valuePrefixDataKey.push('nodes');
  const valueRenderDataKey = await generateRenderDataKey(valueTableInfo, roles);

  queryDataKeys.push(valuePrefixDataKey.concat(['id']));
  if (valueRenderDataKey) {
    queryDataKeys.push(valuePrefixDataKey.concat(valueRenderDataKey));
  }

  // TODO: Костыль для фильтров, переписать
  const groupFilterString = groupTableInfoFilter && __queryFilterString(groupTableInfoFilter);
  const valueFilterString = valueTableInfoFilter && __queryFilterString(valueTableInfoFilter);

  (queryDataKeys as Array<Array<string | number>>).forEach((queryDataKey) => {
    if (groupFilterString) {
      queryDataKey[0] = `${queryDataKey[0]}${groupFilterString}`;
    }
    if (valueFilterString && valuePrefixDataKey.every((value, index) => value != null && value === queryDataKey[index])) {
      const connectionIndex = valuePrefixDataKey.length - 2;
      queryDataKey[connectionIndex] = `${queryDataKey[connectionIndex]}${valueFilterString}`;
    }
  });
  // Конец костыля

  const queryData = await query(dataKeysToDataTree(queryDataKeys).toString());

  // eslint-disable-next-line func-names
  const formatValues = function <T extends { id: string }>(elements: T[], valueDataKey?: DataKey, additional?: (result: IDataSet, element: T) => void): IDataSet[] {
    return (elements || []).map(element => {
      const result: IDataSet = {id: element.id};
      if (valueDataKey) {
        result.value = getDataByKey(element, valueDataKey);
      }
      if (additional) {
        additional(result, element);
      }

      return result;
    });
  };

  if (groupTableInfo) {
    const nestedValuePrefix = valuePrefixDataKey.slice(groupPrefixDataKey.length);

    return formatValues(
      getDataByKey(queryData, groupPrefixDataKey),
      groupRenderDataKey,
      (result, element) => result.children = formatValues(getDataByKey(element, nestedValuePrefix), valueRenderDataKey));
  }

  return formatValues(getDataByKey(queryData, valuePrefixDataKey), valueRenderDataKey);
}

export type RenderValue<T = any> = { value: T };

export async function getRenderValue(
  tableInfo: TableInfo,
  roles: string[],
  identifier: string | number,
): Promise<RenderValue | null | undefined> {
  const dataKey = await generateRenderDataKey(tableInfo, roles);

  if (dataKey) {
    const innerQuery = dataKeysToDataTree(wrapInArray(dataKey)).toString();
    const generateQuery = (addQuotes: boolean): string => `{
      ${removePluralEnding(camelCase(tableInfo.tableName))}ById(id: ${addQuotes ? `"${identifier}"` : identifier})
      ${innerQuery}
    }`;

    let queryResult = null;

    try {
      queryResult = await query(generateQuery(true), true);
    } catch (withQuotesError) {
      try {
        queryResult = await query(generateQuery(false), true);
      } catch (withoutQuotesError) {
        console.error(`Could't query ${tableInfo.tableName} with id ${identifier}`);
      }
    }

    if (queryResult) {
      return {value: getDataByKey(queryResult, dataKey)};
    }
  }

  return null;
}

export async function generateRenderDataKey(
  tableInfo: TableInfo,
  roles: string[],
): Promise<DataKey> {
  if (tableInfo && roles && roles.length) {
    const referenceRenderColumnInfo = await getReferenceRenderColumnInfo(tableInfo, roles);

    if (referenceRenderColumnInfo != null) {
      const dataKey = [];
      let foreignTableInfo: TableInfo | null = tableInfo;

      do {
        const foreignLinkColumnInfo: ColumnInfo | null = foreignTableInfo.foreignLinkColumnInfoId
          ? await ColumnInfoManager.getById(foreignTableInfo.foreignLinkColumnInfoId)
          : null;
        foreignTableInfo = foreignLinkColumnInfo ? await getReferencedTableInfo(foreignLinkColumnInfo) : null;
        if (foreignTableInfo) {
          dataKey.push(
            `${removePluralEnding(camelCase(foreignTableInfo.tableName))}By${capitalize(camelCase(foreignLinkColumnInfo!.columnName))}`,
          );
        }
      } while (foreignTableInfo && foreignTableInfo.foreignLinkColumnInfoId);

      dataKey.push(camelCase(referenceRenderColumnInfo.columnName));

      return dataKey;
    }
  }

  return null;
}

export async function getReferencedTableInfo(columnInfo: ColumnInfo): Promise<TableInfo | null> {
  const referencedColumnInfoId = getDataByKey(columnInfo, 'foreignColumnInfo', 0);
  const referencedColumnInfo = referencedColumnInfoId && (await ColumnInfoManager.getById(referencedColumnInfoId));

  // noinspection ES6MissingAwait
  return referencedColumnInfo
    ? TableInfoManager.getById(referencedColumnInfo.tableInfoId)
    : null;
}

export async function fullReloadTableInfo(tableInfoId: string): Promise<void> {
  await TableInfoManager.reloadById(tableInfoId);
  const tableInfo = await TableInfoManager.getById(tableInfoId);
  await tableInfo.getColumns(true);
}

export function getFilterType(columnInfo: ColumnInfo, action?: ActionType): FilterType {
  let filterType: FilterType | null = null;

  switch (columnInfo && columnInfo.columnType && columnInfo.columnType.toLowerCase()) {
    case 'date':
      filterType = FilterType.DATE;
      break;
    case 'timestamp without time zone':
      filterType = FilterType.TIMESTAMP;
      break;
    case 'boolean':
      filterType = FilterType.BOOLEAN;
      break;
    case 'character varying':
    case 'text':
      filterType = FilterType.STRING;
  }

  if (!filterType && isNumberAction(action)) {
    filterType = FilterType.NUMBER;
  }

  return filterType;
}
