export interface IGraphQLConnection<T> {
  // noinspection SpellCheckingInspection
  nodes: T[];
  // noinspection SpellCheckingInspection
  edges: any[];
  // noinspection SpellCheckingInspection
  pageInfo: any /*PageInfo*/;
  // noinspection SpellCheckingInspection
  totalCount: number;
}

export interface ITableInfo {
  // noinspection SpellCheckingInspection
  id: string;
  // noinspection SpellCheckingInspection
  tableName: string;
  // noinspection SpellCheckingInspection
  schemaName?: string;
  // noinspection SpellCheckingInspection
  nameId?: string;
  // noinspection SpellCheckingInspection
  linkColumnInfoId?: string;
  // noinspection SpellCheckingInspection
  foreignLinkColumnInfoId?: string;
  // noinspection SpellCheckingInspection
  cardRenderParams?: any /*JSON*/;
  // noinspection SpellCheckingInspection
  colorSettings?: any /*JSON*/;
  // noinspection SpellCheckingInspection
  isCatalog: boolean;
  // noinspection SpellCheckingInspection
  isAudited: boolean;
  // noinspection SpellCheckingInspection
  type?: string;
  // noinspection SpellCheckingInspection
  pageSizes: string;
  // noinspection SpellCheckingInspection
  nameByNameId?: IName;
  // noinspection SpellCheckingInspection
  columnInfoByLinkColumnInfoId?: IColumnInfo;
  // noinspection SpellCheckingInspection
  columnInfoByForeignLinkColumnInfoId?: IColumnInfo;
  // noinspection SpellCheckingInspection
  columnInfosByTableInfoId: IGraphQLConnection<IColumnInfo>;
}

export interface IColumnInfo {
  // noinspection SpellCheckingInspection
  id: string;
  // noinspection SpellCheckingInspection
  tableInfoId: string;
  // noinspection SpellCheckingInspection
  columnName: string;
  // noinspection SpellCheckingInspection
  nameId?: string;
  // noinspection SpellCheckingInspection
  visible: boolean;
  // noinspection SpellCheckingInspection
  defaultVisible: boolean;
  // noinspection SpellCheckingInspection
  width?: number;
  // noinspection SpellCheckingInspection
  wordWrapEnabled?: boolean;
  // noinspection SpellCheckingInspection
  columnType?: string;
  // noinspection SpellCheckingInspection
  defaultValue?: string;
  // noinspection SpellCheckingInspection
  isNullable: boolean;
  // noinspection SpellCheckingInspection
  order?: number;
  // noinspection SpellCheckingInspection
  tableRenderParams?: any /*JSON*/;
  // noinspection SpellCheckingInspection
  defaultGrouping: boolean;
  // noinspection SpellCheckingInspection
  defaultSorting?: string;
  // noinspection SpellCheckingInspection
  subtotalTypeId?: string;
  // noinspection SpellCheckingInspection
  filterTypeId?: string;
  // noinspection SpellCheckingInspection
  tableInfoByTableInfoId?: ITableInfo;
  // noinspection SpellCheckingInspection
  nameByNameId?: IName;
  // noinspection SpellCheckingInspection
  subtotalTypeBySubtotalTypeId?: ISubtotalType;
  // noinspection SpellCheckingInspection
  filterTypeByFilterTypeId?: IFilterType;
  // noinspection SpellCheckingInspection
  columnInfoTagsByColumnInfoId: IGraphQLConnection<IColumnInfoTag>;
  // noinspection SpellCheckingInspection
  columnInfoReferencesByColumnInfoId: IGraphQLConnection<IColumnInfoReference>;
  // noinspection SpellCheckingInspection
  columnInfoReferencesByForeignColumnInfoId: IGraphQLConnection<IColumnInfoReference>;
  // noinspection SpellCheckingInspection
  columnInfoRolesByColumnInfoId: IGraphQLConnection<IColumnInfoRole>;
  // noinspection SpellCheckingInspection
  tableInfosByLinkColumnInfoId: IGraphQLConnection<ITableInfo>;
  // noinspection SpellCheckingInspection
  tableInfosByForeignLinkColumnInfoId: IGraphQLConnection<ITableInfo>;
}

export interface ISubtotalType {
  // noinspection SpellCheckingInspection
  id: string;
  // noinspection SpellCheckingInspection
  name: string;
  // noinspection SpellCheckingInspection
  expression: string;
  // noinspection SpellCheckingInspection
  columnInfosBySubtotalTypeId: IGraphQLConnection<IColumnInfo>;
}

export interface IFilterType {
  // noinspection SpellCheckingInspection
  id: string;
  // noinspection SpellCheckingInspection
  type: string;
  // noinspection SpellCheckingInspection
  name: string;
  // noinspection SpellCheckingInspection
  columnInfosByFilterTypeId: IGraphQLConnection<IColumnInfo>;
}

export interface IName {
  // noinspection SpellCheckingInspection
  id: string;
  // noinspection SpellCheckingInspection
  name: string;
  // noinspection SpellCheckingInspection
  description?: string;
  // noinspection SpellCheckingInspection
  columnInfosByNameId: IGraphQLConnection<IColumnInfo>;
  // noinspection SpellCheckingInspection
  tableInfosByNameId: IGraphQLConnection<ITableInfo>;
}

export interface IColumnInfoReference {
  // noinspection SpellCheckingInspection
  id: string;
  // noinspection SpellCheckingInspection
  columnInfoId: string;
  // noinspection SpellCheckingInspection
  foreignColumnInfoId: string;
  // noinspection SpellCheckingInspection
  columnInfoByColumnInfoId?: IColumnInfo;
  // noinspection SpellCheckingInspection
  columnInfoByForeignColumnInfoId?: IColumnInfo;
}

export interface IColumnInfoRole {
  // noinspection SpellCheckingInspection
  id: string;
  // noinspection SpellCheckingInspection
  columnInfoId?: string;
  // noinspection SpellCheckingInspection
  roleId: string;
  // noinspection SpellCheckingInspection
  columnInfoByColumnInfoId?: IColumnInfo;
  // noinspection SpellCheckingInspection
  roleByRoleId?: IRole;
}

export interface IRole {
  // noinspection SpellCheckingInspection
  id: string;
  // noinspection SpellCheckingInspection
  name: string;
  // noinspection SpellCheckingInspection
  rusName: string;
  // noinspection SpellCheckingInspection
  columnInfoRolesByRoleId: IGraphQLConnection<IColumnInfoRole>;
  // noinspection SpellCheckingInspection
  userRolesByRoleId: IGraphQLConnection<IUserRole>;
}

export interface IUserRole {
  // noinspection SpellCheckingInspection
  userId: string;
  // noinspection SpellCheckingInspection
  roleId: string;
  // noinspection SpellCheckingInspection
  userByUserId?: IUser;
  // noinspection SpellCheckingInspection
  roleByRoleId?: IRole;
}

export interface IUser<TDetails = any> {
  // noinspection SpellCheckingInspection
  id: string;
  // noinspection SpellCheckingInspection
  name: string;
  // noinspection SpellCheckingInspection
  username: string;
  // noinspection SpellCheckingInspection
  email: string;
  // noinspection SpellCheckingInspection
  password: string;
  // noinspection SpellCheckingInspection
  created: any /*Datetime*/;
  // noinspection SpellCheckingInspection
  updated?: any /*Datetime*/;
  // noinspection SpellCheckingInspection
  deleted: boolean;
  // noinspection SpellCheckingInspection
  userDetailsByUserId: IGraphQLConnection<TDetails>;
  // noinspection SpellCheckingInspection
  userRolesByUserId: IGraphQLConnection<IUserRole>;
}

export interface IColumnInfoTag {
  // noinspection SpellCheckingInspection
  id: string;
  // noinspection SpellCheckingInspection
  columnInfoId: string;
  // noinspection SpellCheckingInspection
  tagId: string;
  // noinspection SpellCheckingInspection
  columnInfoByColumnInfoId?: IColumnInfo;
  // noinspection SpellCheckingInspection
  tagByTagId?: ITag;
}

export interface ITag {
  // noinspection SpellCheckingInspection
  nodeId: number;
  // noinspection SpellCheckingInspection
  id: string;
  // noinspection SpellCheckingInspection
  code: string;
  // noinspection SpellCheckingInspection
  name: string;
  // noinspection SpellCheckingInspection
  columnInfoTagsByTagId: IGraphQLConnection<IColumnInfoTag>;
}

export interface ITableExportLog {
  // noinspection SpellCheckingInspection
  nodeId: number;
  // noinspection SpellCheckingInspection
  id: string;
  // noinspection SpellCheckingInspection
  tableInfoId: string;
  // noinspection SpellCheckingInspection
  tableInfoByTableInfoId?: ITableInfo;
  // noinspection SpellCheckingInspection
  userId: string;
  // noinspection SpellCheckingInspection
  userByUserId?: IUser;
  // noinspection SpellCheckingInspection
  ts: any /*Datetime*/;
  // noinspection SpellCheckingInspection
  rowCount: number;
}
