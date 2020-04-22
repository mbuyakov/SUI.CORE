import { ICacheEntry } from '../cacheManager';
import { getDataByKey } from '../dataKey';
import { GqlCacheManager } from '../gql';
import { IColumnInfo, IColumnInfoReference, IColumnInfoRole, IColumnInfoTag, IFilterType, ISubtotalType } from '../types';
import {formatRoleName} from "../utils";

import {Name} from "./Name";

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

  private readonly name?: Name;

  public constructor(item: IColumnInfo) {
    // public
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
    this.nameId = getDataByKey(item, "nameByNameId", "id");
    this.tags = (getDataByKey<IColumnInfoTag[]>(item, "columnInfoTagsByColumnInfoId", "nodes") || []).map(value => value.tagId);
    this.roles = (getDataByKey<IColumnInfoRole[]>(item, "columnInfoRolesByColumnInfoId", "nodes") || [])
      .map(value => getDataByKey(value, "roleByRoleId", "name"))
      .filter(Boolean)
.map(roleName => formatRoleName(roleName));
    this.foreignColumnInfo = (getDataByKey<IColumnInfoReference[]>(item, "columnInfoReferencesByColumnInfoId", "nodes") || []).map(value => value.foreignColumnInfoId);

    // private
    this.name = item.nameByNameId;
  }

  public getNameOrColumnName(): string | undefined {
    return this.nameId
      ? getDataByKey(this.name, "name")
      : this.columnName;
  }
}

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
      nameByNameId {
        id
        name
      }
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

export const ColumnInfoManager = new _ColumnInfoManager();
