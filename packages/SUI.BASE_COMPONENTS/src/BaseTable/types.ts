/* tslint:disable:no-any */
import {Filter, FilterOperation, Sorting, TableRowDetail} from '@devexpress/dx-react-grid';
import {DataKey} from '@smsoft/sui-core';
import {CardType} from 'antd/lib/card';
import * as React from 'react';

export type TableCellRender = (value: any, row: any, tableColumn: any) => React.ReactNode | string;
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

// tslint:disable-next-line:interface-over-type-literal
export type INewSearchProps = ICommonColumnSearchProps & {
  catalog?: string;
  customSelectData?: Array<{title: string | JSX.Element, value: string | number}>; // for customSelect
  format?: string; // for datetime and date
  type?: /*"catalog" |*/ "customSelect" | "datetime" | "date" | "boolean" | "none" | "default";
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

  title?: string;
  width?: number;

  comparator?(a: any, b: any): number;

  groupingCriteria?(value: any): any;
}

export interface IBaseTableProps {
  allowExport?: boolean;
  borderless?: boolean;
  cardType?: CardType;
  cols: IBaseTableColLayout[];
  defaultFilters?: Filter[];
  defaultSortings?: Sorting[];
  defaultWidth?: number;
  extra?: string | JSX.Element;
  filtering?: boolean;
  fitToCardBody?: boolean;
  fitToCollapseBody?: boolean;
  fitToRowDetailContainer?: boolean;
  grouping?: boolean;
  hideRows?: boolean;
  minColumnWidth?: number;
  noColsContent?: React.ReactNode;
  pagination?: boolean;
  paperStyle?: React.CSSProperties;
  rowDetailComponent?: RowDetail;
  rows: any[];
  selection?: boolean;
  sorting?: boolean;
  title?: string | JSX.Element;
  toolbarButtons?: JSX.Element[];
  virtual?: boolean;
  visibility?: boolean;
  warnings?: Array<JSX.Element | string>;

  cellStyler?(row: any, value: any): React.CSSProperties;

  expandableFilter?(row: any): boolean;

  getRowId?(row: any): any;

  rowStyler?(row: any): React.CSSProperties;

  selectionFilter?(row: any): boolean;
}
