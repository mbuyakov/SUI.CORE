/* tslint:disable:no-any */
import {Filter, FilterOperation, Grouping, GroupKey, Sorting, TableBandHeader as TableBandHeaderBase, TableRowDetail} from '@devexpress/dx-react-grid';
import {CardType} from 'antd/lib/card';
import * as React from 'react';

import { DataKey } from '../dataKey';

export type TableCellRender = (value: any, row: any, tableColumn: any) => React.ReactNode;
export type TableSearchType = 'select' | 'date' | 'boolean' | 'string' | 'none';
export type RowDetail = React.ComponentType<TableRowDetail.ContentProps>;
export type SortingDirection = 'asc' | 'desc';

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

// tslint:disable-next-line:interface-over-type-literal
export type INewSearchProps = ICommonColumnSearchProps & {
  format?: string; // for datetime and date
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
  filters?: Filter[]; // Remote filtering
  grouping?: Grouping[]; // Remote grouping
  groupSubtotalData?: Map<GroupKey, IGroupSubtotalData>; // Remote grouping
  pageSize?: number; // Remote paging
  sorting?: Sorting[]; // Remote sorting
  totalCount?: number; // Remote paging
}

export interface IRemoteBaseTableFunctions {
  getChildGroups?(currentRows: any[], grouping: Grouping, rootRows: any[]): Array<{ childRows?: any[], key: number | string, value?: any }>; // Remote grouping
  onCurrentPageChange?(currentPage: number): void; // Remote paging
  onExpandedGroupsChange?(expandedGroups: GroupKey[]): void; // Remote grouping
  onFiltersChange?(filters: Filter[]): void; // Remote filtering
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
  defaultFilters?: Filter[];
  defaultSortings?: Sorting[];
  defaultWidth?: number;
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
  pageSizes?: number[];
  paginationEnabled?: boolean;
  paperStyle?: React.CSSProperties;
  rowDetailComponent?: RowDetail;
  rows: any[];
  selectionEnabled?: boolean;
  sortingEnabled?: boolean;
  title?: string | JSX.Element;
  toolbarButtons?: JSX.Element[];
  virtual?: boolean;
  visibilityEnabled?: boolean;
  warnings?: Array<JSX.Element | string>;

  cellStyler?(row: any, value: any, column: IBaseTableColLayout): React.CSSProperties;
  expandableFilter?(row: any): boolean;
  getRowId?(row: any): any;

  onSelectionChange?(selection: TSelection[]): void;
  rowStyler?(row: any): React.CSSProperties;
  selectionFilter?(row: any): boolean;
}