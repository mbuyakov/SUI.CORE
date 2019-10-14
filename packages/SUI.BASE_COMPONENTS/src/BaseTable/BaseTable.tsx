/* tslint:disable:no-magic-numbers */
/* tslint:disable:variable-name */
/* tslint:disable:no-any */
import {Getter, Getters} from '@devexpress/dx-react-core';
import {
  CustomGrouping,
  CustomPaging,
  Filter,
  FilteringState,
  GroupingState,
  IntegratedFiltering,
  IntegratedGrouping,
  IntegratedPaging,
  IntegratedSelection,
  IntegratedSorting,
  PagingState,
  RowDetailState,
  SelectionState,
  Sorting,
  SortingState,
  TableColumnWidthInfo
} from '@devexpress/dx-react-grid';
import {
  ColumnChooser,
  DragDropProvider,
  Grid,
  GroupingPanel,
  PagingPanel,
  Table,
  TableColumnReordering,
  TableColumnResizing,
  TableColumnVisibility,
  TableFilterRow,
  TableGroupRow,
  TableHeaderRow,
  TableRowDetail,
  TableSelection,
  Toolbar,
  VirtualTable
} from '@devexpress/dx-react-grid-material-ui';
import {TableRow} from '@material-ui/core';
import {defaultIfNotBoolean, getDataByKey, translate} from "@smsoft/sui-core";
import Result from 'ant-design-pro/lib/Result';
import {Card, Icon, Spin} from 'antd';
import autobind from 'autobind-decorator';
import classnames from 'classnames'
import * as React from 'react';
import * as XLSX from 'xlsx';

import {HIDE_BUTTONS, LOADING_SPIN_WRAPPER} from "../styles";

import { EmptyMessageComponent, ExportPlugin, GroupSummaryRow, TableNoDataCell, WarningPlugin } from './extends';
import { BooleanColumnFilter, CustomSelectFilter, DateColumnFilter, DatetimeColumnFilter, StringColumnFilter } from './filters';
import { defaultSelection, ISelectionTable } from './ISelectionTable';
import {
  IBaseTableColLayout,
  IBaseTableProps,
  IRemoteBaseTableFields,
  IRemoteBaseTableFunctions, SortingDirection,
  TableCellRender
} from './types';

const Cell = Table.Cell;
const ToggleCell = TableRowDetail.ToggleCell;
const SelectionCell = TableSelection.Cell;
const PagingPanelContainer = PagingPanel.Container;
const ToolbarRoot = Toolbar.Root;
const TableGroupRowContent = TableGroupRow.Content;

// Не нашел куда добавить
export function booleanRender(value: boolean | null | undefined): JSX.Element {
  return (typeof(value)=== "boolean")
    ? value
      ? <Icon type="check" theme="outlined"/>
      : <Icon type="close" theme="outlined"/>
    : <Icon type="question" theme="outlined"/>;
}

export class BaseTable<TSelection = defaultSelection>
  extends React.Component<IBaseTableProps<TSelection> & IRemoteBaseTableFields & IRemoteBaseTableFunctions,
    { selection?: TSelection[]; }>
  implements ISelectionTable<TSelection> {

  // tslint:disable-next-line:no-any
  private static getRowId(row: any): any {
    // tslint:disable-next-line:triple-equals
    const id = (row.id != null) ? row.id : row.compoundKey;

    if (id === null || id === undefined) {
      console.error('ROW DOESN\'T HAVE ID!');
    }

    return id;
  }

  private static getSearchComponent(props: any): React.ReactNode {
    const searchProps = {...props, ...props.column.search};

    switch (props.column.search && props.column.search.type) {
      case "customSelect":
        return (<CustomSelectFilter {...searchProps} />);
      case "datetime":
        return (<DatetimeColumnFilter {...searchProps} />);
      case "date":
        return (<DateColumnFilter {...searchProps} />);
      case "boolean":
        return (<BooleanColumnFilter {...searchProps} />);
      case "none":
        return null;
      default:
        return (<StringColumnFilter {...props}/>);
    }
  }

  private static pageInfo({from, to, count}: { count: number, from: number, to: number }): string {
    return `${from}-${to} из ${count}`;
  }

  private static virtualPageInfo({count}: { count: number }): string {
    return `Количество записей: ${count}`;
  }

  private exportData?: any[];

  public constructor(props: any) {
    super(props);
    this.state = {
      selection: this.props.initialSelection || [],
    };
  }

  public clearSelection(): void {
    return this.setState({selection: []});
  }

  public getSelection(): TSelection[] {
    return this.state && this.state.selection || [];
  }

  @autobind
  public mapCols(): Array<IBaseTableColLayout & { name: string, title: string, getCellValue(row: any): any }> {
    return this.props.cols.map(col => ({
      ...col,
      getCellValue: (row: any): any => (col.dataKey && getDataByKey(row, col.dataKey)) || (col.defaultData !== undefined ? col.defaultData : row[col.id]),
      name: col.id,
      title: col.title || translate(col.id, true) || translate(col.id.replace(/Id$/, '')) as string,
    }));
  }

  // TODO cyclomatic-complexity
  // tslint:disable-next-line:cyclomatic-complexity
  public render(): JSX.Element {
    const rowDetail = this.props.rowDetailComponent;
    const paginationEnabled = defaultIfNotBoolean(this.props.paginationEnabled, true);
    const groupingEnabled = defaultIfNotBoolean(this.props.groupingEnabled, true);
    const sortingEnabled = defaultIfNotBoolean(this.props.sortingEnabled, true);
    const filteringEnabled = defaultIfNotBoolean(this.props.filteringEnabled, true);
    const virtual = defaultIfNotBoolean(this.props.virtual, false);
    const visibilityEnabled = defaultIfNotBoolean(this.props.visibilityEnabled, true);
    const selectionEnabled = defaultIfNotBoolean(this.props.selectionEnabled, false);
    const allowExport = defaultIfNotBoolean(this.props.allowExport, true);

    const cols = this.mapCols();

    const defaultSorting = this.props.defaultSortings || this.props.cols
      .filter(col => col.defaultSorting)
      .map<Sorting>(col => ({
        columnName: col.id,
        direction: col.defaultSorting as SortingDirection,
      }));

    if (defaultSorting.length === 0) {
      defaultSorting.push({
        columnName: this.props.cols[0] && this.props.cols[0].id,
        direction: 'asc',
      });
    }

    const defaultExpanded = this.props.cols
      .filter(col => col.defaultExpanded)
      .reduce((prev, cur) => {
        const set = new Set(this.props.rows.map(row => getDataByKey(row, cur.dataKey || cur.id)));

        return [...prev, ...Array.from(set.values())];
      }, [] as any[]);

    const defaultGrouping = this.props.cols
      .filter(col => col.defaultGrouping)
      .map(value => ({columnName: value.id}));

    const enableGrouping = this.props.cols.map(column => ({
      columnName: column.id,
      groupingEnabled: defaultIfNotBoolean(column.groupingEnabled, true)
    }));
    const enableSorting = this.props.cols.map(column => ({
      columnName: column.id,
      sortingEnabled: defaultIfNotBoolean(column.sortingEnabled, true)
    }));

    const sortingExtension = this.props.cols
      .filter(col => col.comparator)
      .map(col => ({
        columnName: col.id,
        compare: col.comparator,
      } as any));

    const groupingExtension: IntegratedGrouping.ColumnExtension[] = this.props.cols
      .filter(col => col.render || col.groupingCriteria)
      .map(col => ({
        columnName: col.id,
        criteria: (value: any, row?: any): { key: any } => ({
          key: col.groupingCriteria ? col.groupingCriteria(value) : (col as any).render(value, row),
        }),
      }));

    const defaultWidth = this.props.cols
      .map<TableColumnWidthInfo>(col => ({
        columnName: col.id,
        width: col.width || this.props.defaultWidth || 200,
      }));

    const defaultHidden = this.props.cols
      .filter(value => !defaultIfNotBoolean(value.defaultVisible, true))
      .map(value => value.id);

    const cellComponent = (props: any): JSX.Element => {
      const render: TableCellRender = props.column.render;
      const value = Array.isArray(props.value) && (props.value[0] ? typeof props.value[0] !== "object" : true)
        ? props.value.toString()
        : props.value;

      return (
        <Table.Cell
          {...props}
          style={this.props.cellStyler ? this.props.cellStyler(props.row, props.value, props.column) : undefined}
        >
          {render ? render(value, props.row, props.tableColumn) : value}
        </Table.Cell>
      );
    };

    const rowComponent = (props: any): JSX.Element =>
      (
        <TableRow
          {...props}
          style={this.props.rowStyler ? this.props.rowStyler(props.row) : undefined}
        />
      );

    const expandableFilter = this.props.expandableFilter;

    function toggleCellComponent(props: any): JSX.Element {
      return (
        expandableFilter && !expandableFilter(props.row)
          ? <Cell {...props} />
          : <ToggleCell {...props}/>
      );
    }

    const selectionFilter = this.props.selectionFilter;

    function selectionCellComponent(props: any): JSX.Element {
      return (
        selectionFilter && selectionFilter(props.row)
          ? <Cell {...props} />
          : <SelectionCell {...props} />
      );
    }

    function pagingContainerComponent(props: any): JSX.Element {
      return (
        <PagingPanelContainer
          {...props}
          className={classnames(props.className, virtual ? HIDE_BUTTONS : undefined)}
        />
      );
    }

    const borderless = this.props.borderless
      || this.props.fitToCardBody
      || this.props.fitToCollapseBody
      || this.props.fitToRowDetailContainer;

    function filterCell(props: any): JSX.Element {
      return (
        <Table.Cell
          value={props.value}
          row={props.row}
          column={props.column}
          tableRow={props.tableRow}
          tableColumn={props.tableColumn}
        >
          {BaseTable.getSearchComponent(props)}
        </Table.Cell>
      );
    }

    const defaultPredicate = (IntegratedFiltering as any).defaultPredicate as (value: any, filter: Filter, row: any) => boolean;

    const filterExtension = cols.map(col => ({
      columnName: col.id,
      predicate: (value: any, filter: Filter, row: any) => {
        let filters = [filter];

        if (filter.operation === "interval") {
          const filterValue = filter.value as unknown as [string, string];

          filters = [
            {
              columnName: filter.columnName,
              operation: "greaterThanOrEqual",
              value: filterValue && filterValue[0]
            },
            {
              columnName: filter.columnName,
              operation: "lessThanOrEqual",
              value: filterValue && filterValue[1]
            }
          ];
        }

        return filters.every(innerFilter =>
          innerFilter.value === null || innerFilter.value === undefined
            ? true
            : defaultPredicate(value, innerFilter, row));
      }
    }));

    const hasSubtotals = (this.props.cols || []).some(col => !!col.subtotal);
    const groupSubtotalData = this.props.groupSubtotalData;

    const tableGroupRowContentComponent = (props: any) => {
      const subtotalData = groupSubtotalData && groupSubtotalData.get(props.row.compoundKey);

      return (
        <span>
          <TableGroupRowContent {...props} />
          {subtotalData && <span>  (<em>Записей: {subtotalData.elements}</em>)</span>}
        </span>
      );
    };

    return (
      <Card
        style={{
          ...(borderless ? {} : {margin: 10}),
          ...(this.props.fitToCardBody ? {margin: -24, marginTop: -23} : {}),
          ...(this.props.fitToCollapseBody ? { margin: -16 } : {}),
          ...(this.props.fitToRowDetailContainer ? {margin: "-3px -24px"} : {}),
          ...(this.props.fitToTabPanelBody ? {margin: 0, marginTop: -17} : {}),
          ...(this.props.paperStyle || {}),
        }}
        bodyStyle={{padding: 0}}
        title={this.props.title}
        type={this.props.cardType}
        extra={this.props.extra}
        bordered={!borderless}
      >
        {cols.length === 0 && <>
          {this.props.noColsContent}
          <Result
            style={{paddingTop: 42}}
            type="error"
            title="Нет доступных колонок"
          />
        </>}
        {cols.length !== 0 && <Grid
          rows={this.props.hideRows ? [] : this.props.rows}
          columns={cols}
          getRowId={this.props.getRowId || (BaseTable.getRowId)}
        >
          {filteringEnabled && (
            <FilteringState
              filters={this.props.filters}
              onFiltersChange={this.props.onFiltersChange}
              defaultFilters={this.props.defaultFilters || []}
            />
          )}
          {rowDetail && <RowDetailState defaultExpandedRowIds={[]}/>}
          {sortingEnabled && (
            <SortingState
              columnExtensions={enableSorting}
              sorting={this.props.sorting}
              defaultSorting={defaultSorting}
              onSortingChange={this.props.onSortingChange}
            />
          )}
          {groupingEnabled && (
            <GroupingState
              grouping={this.props.grouping}
              expandedGroups={this.props.expandedGroups}
              onGroupingChange={this.props.onGroupingChange}
              onExpandedGroupsChange={this.props.onExpandedGroupsChange}
              defaultGrouping={defaultGrouping}
              defaultExpandedGroups={defaultExpanded}
              columnExtensions={enableGrouping}
            />
          )}
          {paginationEnabled && (
            <PagingState
              defaultCurrentPage={0}
              defaultPageSize={virtual ? 0 : 10}
              currentPage={this.props.currentPage}
              pageSize={this.props.pageSize}
              onCurrentPageChange={this.props.onCurrentPageChange}
              onPageSizeChange={this.props.onPageSizeChange}
            />
          )}
          {selectionEnabled && <SelectionState
            selection={(this.state && this.state.selection) as any}
            onSelectionChange={this.onSelectionChange as any}
          />}
          {groupingEnabled && (this.props.getChildGroups
            ? <CustomGrouping
              getChildGroups={this.props.getChildGroups}
              grouping={this.props.customGrouping}
              expandedGroups={this.props.customExpandedGroups}
            />
            : <IntegratedGrouping columnExtensions={groupingExtension}/>)}
          {filteringEnabled && !this.props.onFiltersChange && <IntegratedFiltering columnExtensions={filterExtension}/>}
          {sortingEnabled && !this.props.onSortingChange && <IntegratedSorting columnExtensions={sortingExtension}/>}
          {allowExport && <Getter
            name="rows"
            computed={this.getterComputed}
          />}
          {paginationEnabled && (typeof (this.props.totalCount) === "number"
              ? <CustomPaging totalCount={this.props.totalCount}/>
              : <IntegratedPaging/>
          )}
          {selectionEnabled && <IntegratedSelection/>}
          <DragDropProvider/>
          {virtual
            ? <VirtualTable
              cellComponent={cellComponent}
              noDataCellComponent={TableNoDataCell}
              rowComponent={rowComponent}
            />
            : <Table
              cellComponent={cellComponent}
              noDataCellComponent={TableNoDataCell}
              rowComponent={rowComponent}
            />}
          {rowDetail && <TableRowDetail
            contentComponent={rowDetail}
            toggleCellComponent={toggleCellComponent}
          />}
          <TableColumnResizing
            minColumnWidth={this.props.minColumnWidth || 30}
            defaultColumnWidths={defaultWidth}
          />
          <TableHeaderRow showSortingControls={sortingEnabled}/>
          {filteringEnabled && <TableFilterRow cellComponent={filterCell}/>}
          {paginationEnabled && <PagingPanel
            containerComponent={pagingContainerComponent}
            pageSizes={this.props.pageSizes || (virtual ? undefined : [10, 25, 50, 0])}
            messages={{
              info: virtual ? BaseTable.virtualPageInfo : BaseTable.pageInfo,
              rowsPerPage: 'Записей на страницу',
              showAll: 'Все',
            }}
          />}
          {selectionEnabled && <TableSelection
            cellComponent={selectionCellComponent}
            showSelectAll={!this.props.selectionFilter}
          />}
          {groupingEnabled && <TableGroupRow contentComponent={tableGroupRowContentComponent}/>}
          {groupingEnabled && this.props.groupSubtotalData && hasSubtotals && <GroupSummaryRow subtotalData={this.props.groupSubtotalData}/>}
          <TableColumnReordering defaultOrder={this.props.cols.map(value => value.id)}/>
          {visibilityEnabled && <TableColumnVisibility
            defaultHiddenColumnNames={defaultHidden}
            emptyMessageComponent={EmptyMessageComponent}
          />}
          {(visibilityEnabled || groupingEnabled || allowExport || this.props.toolbarButtons) && (
            <Toolbar
              rootComponent={this.toolbarRootComponent}
            />
          )}
          {visibilityEnabled && <ColumnChooser messages={{showColumnChooser: 'Отобразить выбор колонок'}}/>}
          {allowExport && <ExportPlugin onClick={this.onExport}/>}
          {groupingEnabled && <GroupingPanel
            messages={{groupByColumn: 'Перетащите заголовок колонки сюда для группировки'}}
            showGroupingControls={true}
            showSortingControls={true}
          />}
          {this.props.toolbarButtons}
        </Grid>}
        {this.props.loading && (
          <div className={LOADING_SPIN_WRAPPER}>
            <Spin
              tip="Подождите..."
            />
          </div>
        )}
      </Card>);
  }

  @autobind
  private getterComputed({ rows }: Getters): any[] {
    this.exportData = rows.map((row: any) => ({ ...row }));

    return rows;
  }

  @autobind
  private onExport(): void {
    const cols = this.mapCols().filter(col => defaultIfNotBoolean(col.exportable, true));
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    const formattedData = this.exportData.map(row => {
      const ret = {};
      cols.forEach(col => {
        // tslint:disable-next-line:ban-ts-ignore
        // @ts-ignore
        ret[col.title] = col.getCellValue(row);
      });

      return ret;
    });
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    console.log(formattedData);
    const ws = XLSX.utils.json_to_sheet(formattedData, {
        header: cols.map(col => col.title)
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '1');
    XLSX.writeFile(wb, 'table.xlsx');
  }

  @autobind
  private onSelectionChange(selection: TSelection[]): void {
    this.setState(
      {selection},
      () => {
        if (this.props.onSelectionChange) {
          this.props.onSelectionChange(selection);
        }
      }
    );
  }

  @autobind
  private toolbarRootComponent(props: any): JSX.Element {
    return (
      <ToolbarRoot {...props}>
        {(this.props.warnings && this.props.warnings.length ? [<WarningPlugin messages={this.props.warnings} key={-1}/>] : []).concat([props.children])}
      </ToolbarRoot>);
  }

}
