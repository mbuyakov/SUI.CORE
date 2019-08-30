import {SelectData} from "@smsoft/sui-base-components";
import {addPluralEnding, camelCase, capitalize, DataKey, dataKeysToDataTree, getDataByKey, query, removePluralEnding, wrapInArray} from "@smsoft/sui-core";

import {ColumnInfo, ColumnInfoManager, TableInfo, TableInfoManager} from "../cache";

import {getMetaInitProps, IRawRoute} from "./init";

export type RouteType = 'card' | 'table';

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
  id?: string | number
): string | null {
  const link = routeLinks.find(value => value.type === type && value.entity === camelCase(tableName));
  if (link) {
    return id ? link.path.replace(':id', id.toString()) : link.path;
  }

  const metaInitProps = getMetaInitProps();

  return (metaInitProps && metaInitProps.defaultGetLinkForTable)
    ? metaInitProps.defaultGetLinkForTable(tableName, type, id)
    : null;
}

export async function generateCatalogDataPromise(tableName: string, valueColumnName?: string): Promise<SelectData> {
  const selectColumn = valueColumnName ? camelCase(valueColumnName) : 'id';

  const queryData = await query(`{
    all${capitalize(camelCase(addPluralEnding(tableName)))} {
      nodes {
        id
        ${selectColumn}
      }
    }
  }`, true);

  // tslint:disable-next-line:no-any
  return (getDataByKey(queryData, "nodes") || []).map((element: any) => ({
    value: element[selectColumn || 'id'],
  }));
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
  return columnInfo.visible && roles.some(role => columnInfo.roles.includes(role));
}

export async function getReferenceRenderColumnInfo(
  tableInfo: TableInfo,
  roles: string[]
): Promise<ColumnInfo | null> {
  return __getReferenceRenderColumnInfo(tableInfo, roles, []);
}

async function __getReferenceRenderColumnInfo(
  tableInfo: TableInfo,
  roles: string[],
  visitedTableInfoIds: string[]
): Promise<ColumnInfo | null> {
  if (!visitedTableInfoIds.includes(tableInfo.id)) {
    visitedTableInfoIds.push(tableInfo.id);
  } else {
    throw new Error(`Поле ссылки из другого объекта с id = ${tableInfo.id} рекурсивно ссылается сам на себя (см. foreign_column_info)`);
  }

  const foreignLinkColumnInfo = tableInfo
    && tableInfo.foreignLinkColumnInfoId
    && await ColumnInfoManager.getById(tableInfo.foreignLinkColumnInfoId);

  if (foreignLinkColumnInfo) {
    const referencedTableInfo = await getReferencedTableInfo(foreignLinkColumnInfo);
    const forwardReferencedForeignLinkColumnInfo = referencedTableInfo && await __getReferenceRenderColumnInfo(referencedTableInfo, roles, visitedTableInfoIds);

    // tslint:disable-next-line:triple-equals
    if (forwardReferencedForeignLinkColumnInfo != null) {
      return forwardReferencedForeignLinkColumnInfo;
    }
    if (isAllowedColumnInfo(foreignLinkColumnInfo, roles) && foreignLinkColumnInfo.columnName !== "id") {
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

// tslint:disable-next-line:no-any
export interface IDataSet<T = any> {
  children?: IDataSet[];
  id: string | number;
  value?: T;
}

export function getDataSetRender(dataSet: IDataSet): string {
  return dataSet.hasOwnProperty("value")
    // tslint:disable-next-line:triple-equals
    ? (dataSet.value != null ? String(dataSet.value) : dataSet.value)
    : dataSet.id;
}

export async function getDataSet(
  roles: string[],
  valueTableInfo: TableInfo,
  groupTableInfo?: TableInfo,
): Promise<IDataSet[]> {
  const queryDataKeys: DataKey[] = [];
  let groupRenderDataKey = null;
  const valuePrefixDataKey = [];
  const groupPrefixDataKey: DataKey = [];

  if (groupTableInfo) {
    groupPrefixDataKey.push(toConnectionName(groupTableInfo), "nodes");
    queryDataKeys.push(groupPrefixDataKey.concat(["id"]));

    groupRenderDataKey = await generateRenderDataKey(groupTableInfo, roles);
    if (groupRenderDataKey) {
      queryDataKeys.push(groupPrefixDataKey.concat(groupRenderDataKey));
    }

    valuePrefixDataKey.push(
      ...groupPrefixDataKey,
      toConnectionName(valueTableInfo, groupTableInfo)
    );
  } else {
    valuePrefixDataKey.push(toConnectionName(valueTableInfo));
  }

  valuePrefixDataKey.push("nodes");
  const valueRenderDataKey = await generateRenderDataKey(valueTableInfo, roles);

  queryDataKeys.push(valuePrefixDataKey.concat(["id"]));
  if (valueRenderDataKey) {
    queryDataKeys.push(valuePrefixDataKey.concat(valueRenderDataKey));
  }

  const queryData = await query(dataKeysToDataTree(queryDataKeys).toString());

  const formatValues = function<T extends {id: string}>(elements: T[], valueDataKey?: DataKey, additional?: (result: IDataSet, element: T) => void): IDataSet[] {
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

// tslint:disable-next-line:interface-over-type-literal no-any
export type RenderValue<T = any> = { value: T };

export async function getRenderValue(
  tableInfo: TableInfo,
  roles: string[],
  identifier: string | number
): Promise<RenderValue | null | undefined> {
  const dataKey = await generateRenderDataKey(tableInfo, roles);

  if (dataKey) {
    const innerQuery = dataKeysToDataTree(wrapInArray(dataKey)).toString();
    const generateQuery = (addQuotes: boolean) => `{
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
      return {value: getDataByKey(queryResult, dataKey)}
    }
  }

  return null;
}

export async function generateRenderDataKey(
  tableInfo: TableInfo,
  roles: string[]
): Promise<DataKey> {
  if (tableInfo && roles && roles.length) {
    const referenceRenderColumnInfo = await getReferenceRenderColumnInfo(tableInfo, roles);

    // tslint:disable-next-line:triple-equals
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
            `${removePluralEnding(camelCase(foreignTableInfo.tableName))}By${capitalize(camelCase(foreignLinkColumnInfo!.columnName))}`
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
  const referencedColumnInfo = referencedColumnInfoId && await ColumnInfoManager.getById(referencedColumnInfoId);

  return referencedColumnInfo
    ? TableInfoManager.getById(referencedColumnInfo.tableInfoId)
    : null;
}
