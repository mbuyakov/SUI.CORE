// tslint:disable:prefer-function-over-method
import {getDataByKey, GqlCacheManager, ICacheEntry} from "@smsoft/sui-core";

import {IColumnInfo, IColumnInfoReference, IColumnInfoRole, IColumnInfoTag, IFilterType, ISubtotalType} from "../types";

import {NameManager} from "./Name";

export class ColumnInfo {
  public columnName: string;
  public columnType: string | undefined;
  public defaultGrouping: boolean;
  public defaultSorting?: string;
  public defaultVisible: boolean;
  public filterTypeByFilterTypeId?: IFilterType;
  public foreignColumnInfo?: string[];
  public id: string;
  public isNullable: boolean;
  public nameId?: string;
  public order?: number;
  public roles: string[];
  public subtotalTypeBySubtotalTypeId?: ISubtotalType;
  public tableInfoId: string;
  public tableRenderParams?: string;
  public tags: string[];
  public visible: boolean;
  public width?: number;

  public constructor(item: IColumnInfo) {
    this.id = item.id;
    this.tableInfoId = item.tableInfoId;
    this.columnName = item.columnName;
    this.columnType = item.columnType;
    this.isNullable = item.isNullable;
    this.visible = item.visible;
    this.defaultVisible = item.defaultVisible;
    this.defaultSorting = item.defaultSorting;
    this.defaultGrouping = item.defaultGrouping;
    this.width = item.width;
    this.order = item.order;
    this.tableRenderParams = item.tableRenderParams;
    this.subtotalTypeBySubtotalTypeId = item.subtotalTypeBySubtotalTypeId;
    this.filterTypeByFilterTypeId = item.filterTypeByFilterTypeId;
    this.nameId = item.nameId;
    this.tags = (getDataByKey<IColumnInfoTag[]>(item, "columnInfoTagsByColumnInfoId", "nodes") || []).map(value => value.tagId);
    this.roles = (getDataByKey<IColumnInfoRole[]>(item, "columnInfoRolesByColumnInfoId", "nodes") || [])
      .map(value => getDataByKey(value, "roleByRoleId", "name"))
      .filter(Boolean)
      .map(roleName => roleName.replace("ROLE_", ""));
    this.foreignColumnInfo = (getDataByKey<IColumnInfoReference[]>(item, "columnInfoReferencesByColumnInfoId", "nodes") || []).map(value => value.foreignColumnInfoId);
  }

  public async getNameOrColumnName(): Promise<string | undefined> {
    if (this.nameId) {
      return getDataByKey(await NameManager.getById(this.nameId), name);
    }

    return this.columnName;
  }
}

// tslint:disable-next-line:max-classes-per-file class-name
class _ColumnInfoManager extends GqlCacheManager<IColumnInfo, ColumnInfo> {

  protected getFields(): string {
    return `
      id
      tableInfoId
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
      filterTypeByFilterTypeId {
        id
        type
        name
      }
      subtotalTypeBySubtotalTypeId {
        id
        name
        expression
      }
      nameId
      columnInfoTagsByColumnInfoId {
        nodes {
          tagId
        }
      }
      columnInfoRolesByColumnInfoId {
        nodes {
          roleByRoleId {
            name
          }
        }
      }
      columnInfoReferencesByColumnInfoId {
        nodes {
          foreignColumnInfoId
        }
      }
    `;
  }

  protected getTableName(): string {
    return "columnInfo";
  }

  protected mapRawItem(item: IColumnInfo): ICacheEntry<ColumnInfo, string> {
    return {
      key: item.id,
      value: new ColumnInfo(item)
    };
  }
}

// tslint:disable-next-line:variable-name
export const ColumnInfoManager = new _ColumnInfoManager();

async function load(): Promise<void> {
  const timeLabel = "ColumnInfoManager load";
  console.time(timeLabel);
  await ColumnInfoManager.loadAll();
  console.timeEnd(timeLabel);
}
// noinspection JSIgnoredPromiseFromCall
load();
