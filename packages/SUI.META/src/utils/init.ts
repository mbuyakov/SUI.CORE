import { IBaseCardTabLayout } from '@smsoft/sui-base-components/src/Base/BaseCardTabLayout';
import { IUser } from '@smsoft/sui-core';

import { ColumnInfo, ColumnInfoManager, NameManager, TableInfo, TableInfoManager } from '../cache';

import { parseRoutes, RouteType } from './metaUtils';

export interface IColumnInfoToBaseTableColProps {
  columnInfo: ColumnInfo;
  isLinkCol?: boolean;
  rawMode?: boolean;
  roles: string[]; // TODO: roles - быстрый фикс, продумать в будущем
  tableInfo: TableInfo;
}

export interface IRawRoute {
  actions: {
    title: string;
    onClick(): void;
  }
  authority: string[];
  breadcrumb: string;
  breadcrumbFn: Promise<string>;
  cardForEntity?: string[];
  // tslint:disable-next-line:no-any
  component: any;
  group: true;
  icon: string;
  name: string;
  notTab: boolean;
  path: string;
  pathFn: string;
  routes?: IRawRoute[];
  tableForEntity?: string[];
  tabs: boolean;
}

export interface IMetaInitProps {
  // Tmp
  // tslint:disable-next-line:no-any
  extraOmniTableSettingsTab?: IBaseCardTabLayout<any>;
  routes?: IRawRoute[];
  user?: IUser,

  defaultGetLinkForTable?(tableName: string, type: RouteType, id?: string | number): string | null;
  // tslint:disable-next-line:no-any
  routerPushFn(link: any): void;
}

declare let window: Window & {
  META_INIT_PROPS: IMetaInitProps | undefined;
};

export function initMetaInfo(props: IMetaInitProps): void {
  window.META_INIT_PROPS = props;
  parseRoutes(props.routes || []);
  // Костыль !! Требуется вызывать после init ApolloClient
  const timeLabel = 'MetaInfoManagers load';
  console.time(timeLabel);
  // tslint:disable-next-line:no-floating-promises
  Promise.all([TableInfoManager.loadAll(), ColumnInfoManager.loadAll(), NameManager.loadAll()]).then(() => console.timeEnd(timeLabel));
}

export function getMetaInitProps(): IMetaInitProps | undefined {
  return window.META_INIT_PROPS;
}
