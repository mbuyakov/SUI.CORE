import {camelCase, capitalize, loadingErrorNotification, query, removePluralEnding, sleep} from "@smsoft/sui-core";

import {IGraphQLConnection, ITableInfo} from "../types";

import {formatObjectName} from "./metaUtils";
import {ITabSyncerHandlerCb, TabSyncer} from "./TabSyncer";

const DATA_KEY_IN_LOCALSTORAGE = 'meta_info';
export const META_INFO_WAIT_TIME = 100;

let data: ITableInfo[];

export async function getAllData(): Promise<ITableInfo[]> {
  while (!data) {
    await sleep(META_INFO_WAIT_TIME);
  }

  return data;
}

export async function getData(objectName: string, pascalCase: boolean = false, throwError: boolean = true): Promise<ITableInfo | null> {
  while (!data) {
    await sleep(META_INFO_WAIT_TIME);
  }
  const ret = getCurrentData(objectName, pascalCase);
  if (!ret) {
    if (!throwError) {
      return Promise.resolve(null);
    }
    loadingErrorNotification(`Информация о объекте "${formatObjectName(objectName, pascalCase)}" не найдена`);

    return Promise.reject();
  }

  return ret;
}

export function getCurrentData(objectName: string, pascalCase: boolean = false): ITableInfo | undefined {
  const formattedObjectName = formatObjectName(objectName, pascalCase);

  return data.find(value => {
    const formattedTableName = pascalCase ? value.tableName : camelCase(capitalize(removePluralEnding(value.tableName)));

    return formattedTableName === formattedObjectName;
  });
}

const tableInfoQuery = `
...tableInfo
columnInfosByTableInfoId {
  nodes {
    ...colInfo
    columnInfoReferencesByColumnInfoId {
      nodes {
        columnInfoByForeignColumnInfoId {
          ...colInfo
          tableInfoByTableInfoId {
            ...tableInfo
          } 
        }
      }
    }
  }
}
`;

const fragments = `
fragment tableInfo on TableInfo {
  id
  schemaName
  tableName
  linkColumnInfoId
  foreignLinkColumnInfoId
  isCatalog
  cardRenderParams
  nameByNameId {
    name
    description
  }
}

fragment colInfo on ColumnInfo {
  id
  columnName
  columnType
  isNullable
  visible
  defaultVisible
  defaultSorting
  defaultGrouping
  width
  order
  tableRenderParams
  subtotalTypeBySubtotalTypeId {
    id
    name
    expression
  }
  nameByNameId {
    name
    description
  }
  columnInfoTagsByColumnInfoId {
    nodes {
      id
      tagByTagId {
        id
        code
        name
      }
    }
  }
  columnInfoRolesByColumnInfoId {
    nodes {
      roleByRoleId {
        id
        name
      }
    }
  }
}
`;

// tslint:disable-next-line:no-unnecessary-class
export class MetaInfo {

  public static addListener(cb: ITabSyncerHandlerCb<ITableInfo>): number {
    return MetaInfo.tabSyncer.addHandler(cb);
  }

  public static async loadAllData(): Promise<ITableInfo[]> {
    try {
      const dataString = localStorage.getItem(DATA_KEY_IN_LOCALSTORAGE);

      if (dataString) {
        data = JSON.parse(dataString);
      }
    } catch (e) {
      // console.log('[META]Can\'t parse saved meta');
      console.error(e);
    }
    if (!data) {
      data = (await query<{ allTableInfos: IGraphQLConnection<ITableInfo> }>(`{
        allTableInfos {
          nodes {
            ${tableInfoQuery}
          }
        }
      }
      ${fragments}
      `)).allTableInfos.nodes;
    }

    return data;
  }

  public static async loadTableInfoById(id: string): Promise<ITableInfo> {
    const tableInfo = (await query<ITableInfo>(`{
      tableInfoById(id: "${id}") {
          ${tableInfoQuery}
      }
    }
    ${fragments}
    `, true));
    MetaInfo.tabSyncer.pushValue(id, tableInfo);

    return tableInfo;
  }

  public static removeListener(id: number): void {
    MetaInfo.tabSyncer.removeHandler(id);
  }

  // private static data: ITableInfo[] = [];
  private static tabSyncer: TabSyncer<ITableInfo> = new TabSyncer('tableInfo');

  private static async init(): Promise<void> {
    MetaInfo.addListener((key, value) => {
      // // console.log("ITableInfo updated", key, value);
      if (value && data) {
        data[data.findIndex(tableInfo => tableInfo.id === key)] = value;
      }
    });
    console.time('MetaInfo init');
    await MetaInfo.loadAllData();
    console.timeEnd('MetaInfo init');
    // console.log('[META]Init complete', loadedData);
  }
}

// Workaround. Init are private, all ok
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
MetaInfo.init();
