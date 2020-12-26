import autobind from "autobind-decorator";

import { ICacheEntry } from '@/cacheManager';
import { getDataByKey } from '@/dataKey';
import { GqlCacheManager, query } from '@/gql';
import { Logger } from "@/ioc/utils";
import {asyncMap, isNotNull} from '@/other';
import { IColumnInfo, IGraphQLConnection, ITableInfo } from '@/types';

import {ColumnInfo, ColumnInfoManager} from "./ColumnInfo";
import {Name} from "./Name";

export const DEFAULT_PAGE_SIZES = [10, 25, 50, 100, 250, 500, 1000];

const log = new Logger("TableInfo");

export class TableInfo {

  public cardRenderParams?: string;
  public colorSettings?: string;
  public foreignLinkColumnInfoId?: string;
  public id: string;
  public isCatalog: boolean;
  public linkColumnInfoId?: string;
  public nameId?: string;
  public pageSizes: number[];
  public schemaName: string | undefined;
  public tableName: string;
  public type: string | undefined;

  private colIds: string[];
  private readonly name?: Name;

  public constructor(item: ITableInfo) {
    // public
    this.id = item.id;
    this.schemaName = item.schemaName;
    this.tableName = item.tableName;
    this.linkColumnInfoId = item.linkColumnInfoId;
    this.foreignLinkColumnInfoId = item.foreignLinkColumnInfoId;
    this.isCatalog = item.isCatalog;
    this.cardRenderParams = item.cardRenderParams;
    this.colorSettings = item.colorSettings;
    this.nameId = getDataByKey(item, "nameByNameId", "id");
    this.type = item.type;

    try {
      this.pageSizes = item.pageSizes.split(",").map(e => e.trim()).map(e => Number(e));
    } catch (error) {
      log.error(error, "Couldn't parse ITableInfo.pageSizes");
      this.pageSizes = DEFAULT_PAGE_SIZES;
    }

    // private
    this.colIds = (getDataByKey<IColumnInfo[]>(item, "columnInfosByTableInfoId", "nodes") || []).map(columnInfo => columnInfo.id);
    this.name = item.nameByNameId;
  }

  public directGetColumns(): ColumnInfo[] {
    return (this.colIds || []).map(id => ColumnInfoManager.directGetById(id)).filter(isNotNull);
  }

  public async getColumns(refresh: boolean = false): Promise<ColumnInfo[]> {
    if (!this.colIds || refresh) {
      await this.loadColumns();
    }

    return asyncMap(this.colIds, id => ColumnInfoManager.getById(id));
  }

  public getNameOrTableName(): string {
    return this.nameId
      ? getDataByKey(this.name, "name")
      : this.tableName;
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
      pageSizes
      cardRenderParams
      colorSettings
      nameByNameId {
        id
        name
      }
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

export const TableInfoManager = new _TableInfoManager();
