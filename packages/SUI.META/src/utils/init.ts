import {IBaseTableColLayout} from "@smsoft/sui-base-components";

import {ColumnInfo, TableInfo} from "../cache";

import {parseRoutes} from "./metaUtils";

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
  routes?: IRawRoute[];
  baseTableColLayoutGenerateHelper?(result: IBaseTableColLayout, props: IColumnInfoToBaseTableColProps): Promise<void>;
}

declare let window: Window & {
  META_INIT_PROPS: IMetaInitProps | undefined;
};

export function initMetaInfo(props: IMetaInitProps): void {
  window.META_INIT_PROPS = props;
  parseRoutes(props.routes || []);
}

export function getMetaInitProps(): IMetaInitProps | undefined {
  return window.META_INIT_PROPS;
}
