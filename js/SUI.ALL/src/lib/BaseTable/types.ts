import {Filter, FilterOperation, Grouping, GroupKey, Sorting, TableBandHeader as TableBandHeaderBase, TableFilterRow, TableRowDetail} from '@devexpress/dx-react-grid';
import {CardType} from 'antd/lib/card';
import * as React from 'react';

import { DataKey } from '../dataKey';

export type TableCellRender = (value: any, row: any, tableColumn: any) => React.ReactNode;
export type TableSearchType = 'select' | 'date' | 'boolean' | 'string' | 'none';
export type RowDetail = React.ComponentType<TableRowDetail.ContentProps>;
export type SortingDirection = 'asc' | 'desc';
export type LazyFilter = Filter & { lazy?: boolean };
export type LazyTableFilterRowCellProps = Omit<TableFilterRow.CellProps, "filter" | "onFilter"> & {
  filter: LazyFilter | null;
  onFilter(filter: LazyFilter | null): void;
}

export interface ISearchProps /*extends TableFilterRow.CellProps*/
{
  data?: any[];
  dataKey?: DataKey;
  nameProperty?: string;
  operation?: FilterOperation;
  // NOT WORKING
  placeholder?: string;
  query?: string;
  valueProperty?: string;

  optionFilter?(option: any): boolean;
}

export interface ICommonColumnSearchProps {
  disabled?: boolean;
  hidden?: boolean;
  operation?: FilterOperation;
  placeholder?: string | [string, string];
}

export type SelectData = Array<{title?: string | JSX.Element, value: string | number}>;

export type CompoundFormat = {format?: string, targetFormat?: string, sourceFormat?: string};

export type INewSearchProps = ICommonColumnSearchProps & {
  allFormats?: CompoundFormat;
  format?: string; // for datetime and date
  multiple?: boolean; // for customSelect
  selectData?: SelectData | Promise<SelectData>; // for customSelect
  type?: "customSelect" | "datetime" | "date" | "boolean" | "none" | "default" | string;
  optionFilter?(option: any): boolean; // for selects
}

export interface IBaseTableColLayout {
  dataKey?: DataKey;
  defaultData?: any;
  defaultExpanded?: boolean;
  defaultGrouping?: boolean;
  defaultSorting?: SortingDirection;
  defaultVisible?: boolean;
  exportable?: boolean;
  groupingEnabled?: boolean;
  id: string;
  render?: TableCellRender;
  search?: INewSearchProps;

  // Удалить searchProps, searchRef, searchType при удалении columns.ts
  searchProps?: ISearchProps;
  searchRef?: string;
  searchType?: TableSearchType;

  sortingEnabled?: boolean;

  subtotal?: {expression: string, name: string};

  title?: string;
  width?: number;

  comparator?(a: any, b: any): number;

  groupingCriteria?(value: any): any;
}

export interface IGroupSubtotalData {
  data?: object;
  elements: number;
}

export interface IRemoteBaseTableFields {
  currentPage?: number; // Remote paging
  customExpandedGroups?: GroupKey[]; // Remote grouping
  customGrouping?: Grouping[]; // Remote grouping
  expandedGroups?: GroupKey[]; // Remote grouping
  filters?: LazyFilter[]; // Remote filtering
  grouping?: Grouping[]; // Remote grouping
  groupSubtotalData?: Map<GroupKey, IGroupSubtotalData>; // Remote grouping
  sorting?: Sorting[]; // Remote sorting
  totalCount?: number; // Remote paging
}

export interface IRemoteBaseTableFunctions {
  customFilterComponent?(props: LazyTableFilterRowCellProps, column: IBaseTableColLayout, type?: string): JSX.Element | null;
  getChildGroups?(currentRows: any[], grouping: Grouping, rootRows: any[]): Array<{ childRows?: any[], key: number | string, value?: any }>; // Remote grouping
  onCurrentPageChange?(currentPage: number): void; // Remote paging
  onExpandedGroupsChange?(expandedGroups: GroupKey[]): void; // Remote grouping
  onFiltersChange?(filters: LazyFilter[]): void; // Remote filtering
  onGroupingChange?(grouping: Grouping[]): void; // Remote grouping
  onPageSizeChange?(pageSize: number): void; // Remote paging
  onSortingChange?(sorting: Sorting[]): void; // Remote sorting
}

export interface IBaseTableProps<TSelection = any> {
  allowExport?: boolean;
  borderless?: boolean;
  cardType?: CardType;
  cols: IBaseTableColLayout[];
  columnBands?: TableBandHeaderBase.ColumnBands[];
  defaultCurrentPage?: number;
  defaultFilters?: Filter[];
  defaultSortings?: Sorting[];
  defaultWidth?: number;
  disabledFilters?: string[];
  extra?: string | JSX.Element;
  filteringEnabled?: boolean;
  fitToCardBody?: boolean;
  fitToCollapseBody?: boolean;
  fitToRowDetailContainer?: boolean;
  fitToTabPanelBody?: boolean;
  groupingEnabled?: boolean;
  hideRows?: boolean;
  initialSelection?: TSelection[];
  loading?: boolean;
  minColumnWidth?: number;
  noColsContent?: React.ReactNode;
  pageSize?: number;
  pageSizes?: number[];
  paginationEnabled?: boolean;
  paperStyle?: React.CSSProperties;
  resizingEnabled?: boolean;
  rowDetailComponent?: RowDetail;
  rows: any[];
  selectionEnabled?: boolean;
  singleSelection?: boolean;
  sortingEnabled?: boolean;
  title?: string | JSX.Element;
  toolbarButtons?: JSX.Element[];
  toolbarEnabled?: boolean;
  virtual?: boolean;
  visibilityEnabled?: boolean;
  warnings?: Array<JSX.Element | string>;

  beforeExport?(): Promise<boolean>; // TODO: Костыль, удалить при переводе экспорта на бек
  cellStyler?(row: any, value: any, column: IBaseTableColLayout): React.CSSProperties;
  customFilterComponent?(props: TableFilterRow.CellProps, column: IBaseTableColLayout, type?: string): JSX.Element | null;
  expandableFilter?(row: any): boolean;
  getRowId?(row: any): any;

  onSelectionChange?(selection: TSelection[]): void;
  rowStyler?(row: any): React.CSSProperties;
  selectionFilter?(row: any): boolean;
}
