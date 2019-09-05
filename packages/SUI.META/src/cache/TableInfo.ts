// tslint:disable:prefer-function-over-method
import {asyncMap, getDataByKey, GqlCacheManager, ICacheEntry, query} from '@smsoft/sui-core';
import autobind from "autobind-decorator";

import {IColumnInfo, IGraphQLConnection, ITableInfo} from "../types";

import {ColumnInfo, ColumnInfoManager} from "./ColumnInfo";
import {NameManager} from "./Name";

export class TableInfo {
  public cardRenderParams?: string;
  public foreignLinkColumnInfoId?: string;
  public id: string;
  public isCatalog: boolean;
  public linkColumnInfoId?: string;
  public nameId?: string;
  public schemaName: string | undefined;
  public tableName: string;
  public type: string | undefined;
  private colIds: string[];


  public constructor(item: ITableInfo) {
    this.id = item.id;
    this.schemaName = item.schemaName;
    this.tableName = item.tableName;
    this.linkColumnInfoId = item.linkColumnInfoId;
    this.foreignLinkColumnInfoId = item.foreignLinkColumnInfoId;
    this.isCatalog = item.isCatalog;
    this.cardRenderParams = item.cardRenderParams;
    this.nameId = item.nameId;
    this.type = item.type;
    this.colIds = (getDataByKey<IColumnInfo[]>(item, "columnInfosByTableInfoId", "nodes") || []).map(columnInfo => columnInfo.id);
  }

  public directGetColumns(): ColumnInfo[] {
    return (this.colIds || []).map(id => ColumnInfoManager.directGetById(id)).filter(Boolean) as ColumnInfo[];
  }

  public async getColumns(refresh: boolean = false): Promise<ColumnInfo[]> {
    if (!this.colIds || refresh) {
      await this.loadColumns();
    }

    return asyncMap(this.colIds, id => ColumnInfoManager.getById(id));
  }

  public async getNameOrTableName(): Promise<string | undefined> {
    if (this.nameId) {
      const name = await NameManager.getById(this.nameId);

      return getDataByKey(name, "name");
    }

    return this.tableName;
  }

  public async loadColumns(): Promise<void> {
    this.colIds = (await query<{ nodes: Array<{ id: string }> }>(`{
        allColumnInfos(filter: {tableInfoId: {equalTo: "${this.id}"}}, orderBy: ORDER_ASC) {
          nodes {
            id
          }
        }
      }`, true)).nodes.map(node => node.id);
    await asyncMap(this.colIds, id => ColumnInfoManager.loadById(id));
  }
}

// tslint:disable-next-line:max-classes-per-file class-name
class _TableInfoManager extends GqlCacheManager<ITableInfo, TableInfo> {

  @autobind
  protected async __loadById(id: string): Promise<TableInfo> {
    let tableInfoId = id;

    if (isNaN(id as unknown as number)) {
      tableInfoId = getDataByKey(
        await query<IGraphQLConnection<ITableInfo>>(
          `{
            allTableInfos(filter: {tableName: {equalTo: "${id}"}}) {
              nodes {
                id
              }
            }
          }`,
          true,
        ), "nodes", 0, "id");

      // tslint:disable-next-line:triple-equals
      if (id == null) {
        throw new Error(`TableInfoManager: couldn't find TableInfo with tableName = ${id}`);
      }
    }

    return super.__loadById(tableInfoId);
  }

  protected getFields(): string {
    return `
      id
      schemaName
      tableName
      linkColumnInfoId
      foreignLinkColumnInfoId
      isCatalog
      cardRenderParams
      nameId
      type
      columnInfosByTableInfoId(orderBy: ORDER_ASC) {
        nodes {
          id
        }
      }
    `;
  }

  protected getTableName(): string {
    return 'tableInfo';
  }

  protected mapRawItem(item: ITableInfo): ICacheEntry<TableInfo, string> {
    return {
      key: item.id,
      value: new TableInfo(item),
    };
  }
}

// tslint:disable-next-line:variable-name
export const TableInfoManager = new _TableInfoManager();
