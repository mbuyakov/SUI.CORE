/* tslint:disable:no-magic-numbers no-any */
/* tslint:disable:variable-name */
import { Getter, Getters } from '@devexpress/dx-react-core';
import {Filter, FilteringState, GroupingState, IntegratedFiltering, IntegratedGrouping, IntegratedPaging, IntegratedSelection, IntegratedSorting, PagingState, RowDetailState, SelectionState, Sorting, SortingState, TableColumnWidthInfo} from '@devexpress/dx-react-grid';
import {ColumnChooser, DragDropProvider, Grid, GroupingPanel, PagingPanel, Table, TableColumnReordering, TableColumnResizing, TableColumnVisibility, TableFilterRow, TableGroupRow, TableHeaderRow, TableRowDetail, TableSelection, Toolbar, VirtualTable} from '@devexpress/dx-react-grid-material-ui';
import {TableRow} from '@material-ui/core';
import {defaultIfNotBoolean, getDataByKey, translate} from '@smsoft/sui-core';
import Result from 'ant-design-pro/lib/Result';
import {Card, Icon} from 'antd';
import autobind from 'autobind-decorator';
import classnames from 'classnames';
import * as React from 'react';
import * as XLSX from 'xlsx';

import {HIDE_BUTTONS} from "../styles";

import {EmptyMessageComponent, ExportPlugin, TableNoDataCell, WarningPlugin} from './extends';
import {BooleanColumnFilter, CustomSelectFilter, DateColumnFilter, DatetimeColumnFilter, StringColumnFilter} from "./filters";
import {defaultSelection, ISelectionTable} from './ISelectionTable';
import {IBaseTableProps, TableCellRender} from './types';

const Cell = Table.Cell;
const ToggleCell = TableRowDetail.ToggleCell;
const SelectionCell = TableSelection.Cell;
const PagingPanelContainer = PagingPanel.Container;
const ToolbarRoot = Toolbar.Root;

// Не нашел куда добавить
export function booleanRender(value: boolean): JSX.Element {
  // noinspection SuspiciousTypeOfGuard
  return (typeof (value) === "boolean")
    ? value
      ? <Icon type="check" theme="outlined"/>
      : <Icon type="close" theme="outlined"/>
    : <Icon type="question" theme="outlined"/>
}

export class BaseTable<TSelection = defaultSelection>
  extends React.Component<IBaseTableProps,
    { selection?: TSelection[]; }>
  implements ISelectionTable<TSelection> {

  private static getRowId(row: any): any {
    const id = row.id;
    if (id === null || id === undefined) {
      console.error('ROW DOESN\'T HAVE ID!');
    }

    return id;
  }

  private static getSearchComponent(props: any): React.ReactNode {
    const searchProps = {...props, ...props.column.search};

    switch (props.column.search && props.column.search.type) {
      /*case "catalog":
        return (<CatalogColumnFilter {...searchProps} />);*/
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
      selection: [],
    };
  }

  public clearSelection(): void {
    this.setState({selection: []});
  }

  public getSelection(): TSelection[] {
    return this.state && this.state.selection || [];
  }

  // TODO cyclomatic-complexity
  // tslint:disable-next-line:cyclomatic-complexity
  public render(): JSX.Element {
    const rowDetail = this.props.rowDetailComponent;
    const pagination = defaultIfNotBoolean(this.props.pagination, true);
    const grouping = defaultIfNotBoolean(this.props.grouping, true);
    const sorting = defaultIfNotBoolean(this.props.sorting, true);
    const filtering = defaultIfNotBoolean(this.props.filtering, true);
    const virtual = defaultIfNotBoolean(this.props.virtual, false);
    const visibility = defaultIfNotBoolean(this.props.visibility, true);
    const selection = defaultIfNotBoolean(this.props.selection, false);
    const allowExport = defaultIfNotBoolean(this.props.allowExport, true);

    const cols = this.props.cols.map(col => ({
      ...col,
      getCellValue: (row: any): any => (col.dataKey && getDataByKey(row, col.dataKey)) || (col.defaultData !== undefined ? col.defaultData : row[col.id]),
      name: col.id,
      title: col.title || translate(col.id, true) || translate(col.id.replace(/Id$/, '')) as string,
    }));

    const defaultSorting = this.props.defaultSortings || this.props.cols
      .filter(col => col.defaultSorting)
      .map<Sorting>(col => ({
        columnName: col.id,
        direction: col.defaultSorting as any,
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

    const enableGrouping = this.props.cols
      .map(value => ({columnName: value.id, groupingEnabled: defaultIfNotBoolean(value.groupingEnabled, true)}));

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

      return (
        <Table.Cell
          {...props}
          style={this.props.cellStyler ? this.props.cellStyler(props.row, props.value) : undefined}
        >
          {render && render(props.value, props.row, props.tableColumn)}
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
          const filterValue = filter.value as any as [string, string];

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

        console.log(filters);

        return filters.every(innerFilter =>
          innerFilter.value === null || innerFilter.value === undefined
            ? true
            : defaultPredicate(value, innerFilter, row));
      }
    }));

    return (
      <Card
        style={{
          ...(borderless ? {} : {margin: 10}),
          ...(this.props.fitToCardBody ? {margin: -24, marginTop: -23} : {}),
          ...(this.props.fitToCollapseBody ? {margin: -2} : {}),
          ...(this.props.fitToRowDetailContainer ? {margin: "-3px -24px"} : {}),
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
          {filtering && <FilteringState defaultFilters={this.props.defaultFilters || []}/>}
          {rowDetail && <RowDetailState defaultExpandedRowIds={[]}/>}
          {sorting && <SortingState defaultSorting={defaultSorting}/>}
          {grouping && <GroupingState defaultGrouping={defaultGrouping} defaultExpandedGroups={defaultExpanded as any[]} columnExtensions={enableGrouping}/>}
          {pagination && <PagingState defaultCurrentPage={0} defaultPageSize={virtual ? 0 : 10}/>}
          {selection && <SelectionState
            selection={(this.state && this.state.selection) as any}
            onSelectionChange={this.onSelectionChange as any}
          />}
          {grouping && <IntegratedGrouping columnExtensions={groupingExtension}/>}
          {filtering && <IntegratedFiltering columnExtensions={filterExtension}/>}
          {sorting && <IntegratedSorting columnExtensions={sortingExtension}/>}
          {allowExport && <Getter
            name="rows"
            computed={this.getterComputed}
          />}
          {pagination && <IntegratedPaging/>}
          {selection && <IntegratedSelection/>}
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
          <TableHeaderRow showSortingControls={sorting}/>
          {filtering && <TableFilterRow cellComponent={filterCell}/>}
          {pagination && <PagingPanel
            containerComponent={pagingContainerComponent}
            pageSizes={virtual ? undefined : [10, 25, 50, 0]}
            messages={{
              info: virtual ? BaseTable.virtualPageInfo : BaseTable.pageInfo,
              rowsPerPage: 'Записей на страницу',
              showAll: 'Все',
            }}
          />}
          {selection && <TableSelection
            cellComponent={selectionCellComponent}
            showSelectAll={!this.props.selectionFilter}
          />}
          {grouping && <TableGroupRow/>}
          <TableColumnReordering defaultOrder={this.props.cols.map(value => value.id)}/>
          {visibility && <TableColumnVisibility defaultHiddenColumnNames={defaultHidden} emptyMessageComponent={EmptyMessageComponent}/>}
          {(visibility || grouping || allowExport || this.props.toolbarButtons) && (
            <Toolbar
              rootComponent={this.toolbarRootComponent}
            />
          )}
          {visibility && <ColumnChooser messages={{showColumnChooser: 'Отобразить выбор колонок'}}/>}
          {allowExport && <ExportPlugin onClick={this.onExport}/>}
          {grouping && <GroupingPanel
            messages={{groupByColumn: 'Перетащите заголовок колонки сюда для группировки'}}
            showGroupingControls={true}
            showSortingControls={true}
          />}
          {this.props.toolbarButtons}
        </Grid>}
      </Card>);
  }

  @autobind
  private getterComputed({rows}: Getters): any[] {
    this.exportData = rows.map((row: any) => ({...row}));

    return rows;
  }

  @autobind
  private onExport(): void {
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    this.exportData = this.exportData.map(row => {
      // tslint:disable-next-line:forin
      for (const oldKey in row) {
        const newKey = translate(oldKey);
        // tslint:disable-next-line:triple-equals
        if (oldKey != newKey) {
          // tslint:disable-next-line:ban-ts-ignore
          // @ts-ignore
          Object.defineProperty(row, newKey, Object.getOwnPropertyDescriptor(row, oldKey));
          // tslint:disable-next-line:no-dynamic-delete
          delete row[oldKey];
        }
      }

      return row;
    });
    console.log(this.exportData);
    delete this.exportData[0]["Тип имени"];
    const ws = XLSX.utils.json_to_sheet(this.exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '1');
    XLSX.writeFile(wb, 'table.xlsx');
  }

  @autobind
  private onSelectionChange(selection: TSelection[]): void {
    console.log(selection);
    this.setState({selection});
  }

  @autobind
  private toolbarRootComponent(props: any): JSX.Element {
    console.log(props);

    return (
      <ToolbarRoot {...props}>
        <WarningPlugin messages={this.props.warnings} key={-1}/>
        {props.children}
      </ToolbarRoot>);
  }

}
