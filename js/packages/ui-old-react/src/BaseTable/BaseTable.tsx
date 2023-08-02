/* eslint-disable @typescript-eslint/no-explicit-any */
import {CheckOutlined, CloseOutlined, QuestionOutlined} from "@ant-design/icons";
import {Getter, Getters, Mui, CustomGrouping, CustomPaging, Filter, FilteringState, GroupingState, IntegratedFiltering, IntegratedGrouping, IntegratedPaging, IntegratedSorting, PagingState, RowDetailState, SelectionState, Sorting, SortingState, TableColumnWidthInfo} from "@sui/deps-dx-react-grid";
import {getDataByKey} from "@sui/util-chore";
import {defaultIfNotBoolean, getSUISettings} from "@sui/ui-old-core";
import {Card, Result, Spin} from "@sui/deps-antd";
import autobind from "autobind-decorator";
import classnames from "classnames";
import * as React from "react";
import {BASE_TABLE, BASE_TABLE_NO_PAGINATION, HIDE_BUTTONS, LOADING_SPIN_WRAPPER} from "@/styles";
import {ColumnChooserContainer, CustomPagingPanelContainer, CustomToggleCell, DoubleScrollbar, EmptyMessageComponent, ExportPlugin, ExtendedIntegratedSelection, GroupSummaryRow, TableNoDataCell, TableNoDataCellSmall, UserSettingsPlugin, UserSettingsSupportPlugin, WarningPlugin} from "@/BaseTable/extends";

import {BooleanColumnFilter, CustomSelectFilter, DateColumnFilter, DatetimeColumnFilter, NumberIntervalColumnFilter, StringColumnFilter, SnilsColumnFilter, OmsColumnFilter, InnColumnFilter, PhoneColumnFilter} from "./filters";
import {defaultSelection, ISelectionTable} from "./ISelectionTable";
import {IBaseTableColLayout, IBaseTableProps, IFormattedBaseTableColLayout, IGroupSubtotalData, INewSearchProps, IRemoteBaseTableFields, IRemoteBaseTableFunctions, TableCellRender} from "./types";
import {exportToXlsx, mapColumns} from "./utils";
import { MuiIcons, TableRow } from "@sui/deps-material";
import {SuiThemeProvider, SuiThemeContext} from "@sui/ui-themes";

const Cell = Mui.Table.Cell;
const SelectionCell = Mui.TableSelection.Cell;
const PagingPanelContainer = CustomPagingPanelContainer;
const ToolbarRoot = Mui.Toolbar.Root;
const TableGroupRowContent = Mui.TableGroupRow.Content;

export function defaultSubtotalInfo(subtotalData: IGroupSubtotalData): React.JSX.Element {
  return (<span>  (<em>Записей: {subtotalData.elements}</em>)</span>);
}

// Не нашел куда добавить
export function booleanRender(value: boolean | null | undefined): React.JSX.Element {
  return (typeof (value) === "boolean")
    ? value
      ? <CheckOutlined/>
      : <CloseOutlined/>
    : <QuestionOutlined/>;
}

export class BaseTable<TSelection = defaultSelection>
  extends React.Component<Omit<IBaseTableProps<TSelection>, "customFilterComponent"> & IRemoteBaseTableFields & IRemoteBaseTableFunctions,
    { selection?: TSelection[]; }>
  implements ISelectionTable<TSelection> {

  private static getRowId(row: any): any {
    const id = (row.id != null) ? row.id : row.compoundKey;

    if (id === null || id === undefined) {
      console.error("ROW DOESN'T HAVE ID!");
    }

    return id;
  }

  private static pageInfo({from, to, count}: { count: number, from: number, to: number }): string {
    return `${from}-${to} из ${count}`;
  }

  private static virtualPageInfo({count}: { count: number }): string {
    return `Количество записей: ${count}`;
  }

  private exportData?: any[];

  private CellComponent = (props: any): React.JSX.Element => {
    const render: TableCellRender = props.column.render;
    const value = Array.isArray(props.value) && (props.value[0] ? typeof props.value[0] !== "object" : true)
      ? props.value.toString()
      : props.value;

    return (
      <Mui.Table.Cell
        {...props}
        style={this.props.cellStyler ? this.props.cellStyler(props.row, props.value, props.column) : undefined}
      >
        {render ? render(value, props.row, props.tableColumn) : value}
      </Mui.Table.Cell>
    );
  };

  private FilterCell = (props: any): React.JSX.Element => (
    <Mui.Table.Cell
      {...props as any}
    >
      {this.getSearchComponent(props)}
    </Mui.Table.Cell>
  );

  private RowComponent = (props: any): React.JSX.Element => (
    <SuiThemeContext.Consumer>
      {theme => (
        <TableRow
          {...props}
          style={this.props.rowStyler ? this.props.rowStyler(props.row, theme) : undefined}
        />
      )}
    </SuiThemeContext.Consumer>
  );

  private ToggleCellComponent = (props: any): React.JSX.Element => (
    (this.props.expandableFilter && !this.props.expandableFilter(props.row))
      ? <Cell {...props} />
      // customize icons
      : <CustomToggleCell {...props} />
  );

  private SelectionCellComponent = (props: any): React.JSX.Element => (
    (props.row.__SUI_available_to_select)
      ? <SelectionCell {...props} />
      : <Cell {...props} />
  );

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public constructor(props: any) {
    super(props);

    if (this.props.singleSelection && this.props.initialSelection && this.props.initialSelection.length > 1) {
      throw new Error(`InitialSelection size for singleSelection mode = ${this.props.initialSelection.length} (must be <= 1)`);
    }

    this.state = {
      selection: this.props.initialSelection || [],
    };
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  public clearSelection(): void {
    return this.setState({selection: []});
  }

  // eslint-disable-next-line react/no-unused-class-component-methods
  public getSelection(): TSelection[] {
    return this.state && this.state.selection || [];
  }

  @autobind
  public mapCols(): IFormattedBaseTableColLayout[] {
    return mapColumns(this.props.cols);
  }

  // TODO cyclomatic-complexity
  public render(): JSX.Element {
    const rowDetail = this.props.rowDetailComponent;
    const paginationEnabled = defaultIfNotBoolean(this.props.paginationEnabled, true);
    const groupingEnabled = defaultIfNotBoolean(this.props.groupingEnabled, true);
    const sortingEnabled = defaultIfNotBoolean(this.props.sortingEnabled, true);
    const filteringEnabled = defaultIfNotBoolean(this.props.filteringEnabled, true);
    const virtual = defaultIfNotBoolean(this.props.virtual, false);
    const visibilityEnabled = defaultIfNotBoolean(this.props.visibilityEnabled, true);
    const highlightEnabled = defaultIfNotBoolean(this.props.highlightRow, false);
    const selectionEnabled = defaultIfNotBoolean(this.props.selectionEnabled, false);
    const resizingEnabled = defaultIfNotBoolean(this.props.resizingEnabled, true);
    const headerEnabled = defaultIfNotBoolean(this.props.headerEnabled, true);
    const allowExport = defaultIfNotBoolean(this.props.allowExport, true);
    const userSettingsEnabled = !!this.props.onSettingsChange;

    const cols = this.mapCols();

    const defaultSorting = this.props.defaultSortings || this.props.cols
      .filter(col => col.defaultSorting)
      .map<Sorting>(col => ({
        columnName: col.id,
        direction: col.defaultSorting,
      }));

    if (defaultSorting.length === 0) {
      defaultSorting.push({
        columnName: this.props.cols[0] && this.props.cols[0].id,
        direction: "asc",
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

    const wordWrapExtension = this.props.cols
      .map(col => ({
        columnName: col.id,
        wordWrapEnabled: defaultIfNotBoolean(col.wordWrapEnabled, false),
      }));

    const defaultWidth = this.props.cols
      .map<TableColumnWidthInfo>(col => ({
        columnName: col.id,
        width: col.width || this.props.defaultWidth || 200,
      }));

    const defaultHidden = this.props.cols
      .filter(value => !defaultIfNotBoolean(value.defaultVisible, true))
      .map(value => value.id);

    const resizingExtension = this.props.cols
      .filter(value => !defaultIfNotBoolean(value.resizingEnabled, true) && value.width)
      .map<Mui.TableColumnResizing.ColumnExtension>(col => ({
        columnName: col.id,
        minWidth: col.width,
        maxWidth: col.width,
      }));

    function pagingContainerComponent(props: any): React.JSX.Element {
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

    const defaultPredicate = (IntegratedFiltering as any).defaultPredicate as (value: any, filter: Filter, row: any) => boolean;

    const filterExtension = cols.map(col => ({
      columnName: col.id,
      predicate: (value: any, filter: Filter, row: any): boolean => {
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

    const tableGroupRowContentComponent = (props: any): React.JSX.Element => {
      const subtotalData = groupSubtotalData && groupSubtotalData.get(props.row.compoundKey);

      return (
        <span>
          <TableGroupRowContent {...props} />
          {subtotalData && (this.props.customSubtotalInfo ?? defaultSubtotalInfo)(subtotalData)}
        </span>
      );
    };

    const tableContainerComponent = (typeof (this.props.doubleVerticalScroll) == "boolean" ? this.props.doubleVerticalScroll : getSUISettings().enableDoubleVerticalScrollForAllTables)
      ? DoubleScrollbar
      : Mui.Table.Container;

    return (
      <SuiThemeContext.Consumer>
        {(theme): JSX.Element => (
          <SuiThemeProvider
            component="baseTable"
          >
            <Card
              style={{
                ...(borderless ? {} : {margin: 10}),
                ...(this.props.fitToCardBody ? {margin: -24, marginTop: -23} : {}),
                ...(this.props.fitToCollapseBody ? {margin: -16, marginBottom: -29} : {}),
                ...(this.props.fitToRowDetailContainer ? {margin: "-3px -24px"} : {}),
                ...(this.props.fitToTabPanelBody ? {margin: 0, marginTop: -17} : {}),
                ...(this.props.paperStyle || {}),
              }}
              bodyStyle={{padding: 0, paddingTop: this.props.toolbarEnabled ? 0 : 1}}
              title={this.props.title}
              type={this.props.cardType}
              extra={this.props.extra}
              bordered={!borderless}
              className={classnames(BASE_TABLE, !paginationEnabled && BASE_TABLE_NO_PAGINATION, theme.name, this.props.className)}
            >
              {cols.length === 0 && <>
                {this.props.noColsContent}
                <Result
                  style={{paddingTop: 12, paddingBottom: 12}}
                  status="error"
                  title="Нет доступных колонок"
                />
              </>}
              {cols.length !== 0 && <Mui.Grid
                rows={this.props.hideRows ? [] : this.props.rows}
                columns={cols}
                getRowId={this.props.getRowId || (BaseTable.getRowId)}
              >
                {filteringEnabled && (
                  <FilteringState
                    filters={this.props.filters}
                    onFiltersChange={this.props.onFiltersChange}
                    defaultFilters={this.props.defaultFilters || []}
                    columnExtensions={(this.props.disabledFilters || []).map(columnName => ({columnName, filteringEnabled: false}))}
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
                    defaultCurrentPage={this.props.defaultCurrentPage}
                    defaultPageSize={virtual ? 0 : 10}
                    currentPage={this.props.currentPage}
                    pageSize={this.props.pageSize}
                    onCurrentPageChange={this.props.onCurrentPageChange}
                    onPageSizeChange={this.props.onPageSizeChange}
                  />
                )}
                {(selectionEnabled || highlightEnabled) && <SelectionState
                  selection={(this.state && this.state.selection) as any}
                  onSelectionChange={this.onSelectionChange as any}
                />}
                {groupingEnabled && (this.props.getChildGroups
                  ? (
                    <CustomGrouping
                      getChildGroups={this.props.getChildGroups}
                      grouping={this.props.customGrouping}
                      expandedGroups={this.props.customExpandedGroups}
                    />
                  )
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
                {(selectionEnabled || highlightEnabled) && (<ExtendedIntegratedSelection selectionFilter={this.props.selectionFilter}/>)}
                <Mui.DragDropProvider/>
                {virtual
                  ? (
                    <Mui.VirtualTable
                      cellComponent={this.CellComponent}
                      containerComponent={tableContainerComponent}
                      noDataCellComponent={this.props.noDataCellComponent || TableNoDataCell}
                      rowComponent={this.RowComponent}
                      columnExtensions={wordWrapExtension}
                    />
                  )
                  : (
                    <Mui.Table
                      cellComponent={this.CellComponent}
                      containerComponent={tableContainerComponent}
                      noDataCellComponent={defaultIfNotBoolean(this.props.toolbarEnabled, true) ? (this.props.noDataCellComponent || TableNoDataCell) : (this.props.noDataCellComponentSmall || TableNoDataCellSmall)}
                      rowComponent={this.RowComponent}
                      columnExtensions={wordWrapExtension}
                    />
                  )}
                {rowDetail && <Mui.TableRowDetail
                  contentComponent={rowDetail}
                  toggleCellComponent={this.ToggleCellComponent}
                />}
                {resizingEnabled && (
                  <Mui.TableColumnResizing
                    minColumnWidth={this.props.minColumnWidth || 30}
                    defaultColumnWidths={defaultWidth}
                    columnExtensions={resizingExtension}
                  />
                )}
                <Mui.TableColumnReordering defaultOrder={this.props.cols.map(value => value.id)}/>
                {userSettingsEnabled && (<UserSettingsSupportPlugin/>)}
                {headerEnabled && <Mui.TableHeaderRow showSortingControls={sortingEnabled}/>}
                {filteringEnabled && <Mui.TableFilterRow cellComponent={this.FilterCell}/>}
                {paginationEnabled && <Mui.PagingPanel
                  // eslint-disable-next-line react/jsx-no-bind
                  containerComponent={pagingContainerComponent}
                  pageSizes={this.props.pageSizes || (virtual ? undefined : [10, 25, 50, 100, 0])}
                  messages={{
                    info: virtual ? BaseTable.virtualPageInfo : BaseTable.pageInfo,
                    rowsPerPage: "Записей на страницу",
                    showAll: "Все",
                  }}
                />}
                {(selectionEnabled || highlightEnabled) && (
                    <Mui.TableSelection
                      highlightRow={highlightEnabled}
                      selectByRowClick={highlightEnabled}
                      showSelectionColumn={!highlightEnabled}
                      cellComponent={this.SelectionCellComponent}
                      showSelectAll={!this.props.singleSelection && !highlightEnabled}
                    />
                )}
                {groupingEnabled && <Mui.TableGroupRow contentComponent={tableGroupRowContentComponent}/>}
                {groupingEnabled && !this.props.hideSubtotalRow && this.props.groupSubtotalData && hasSubtotals && <GroupSummaryRow subtotalData={this.props.groupSubtotalData}/>}
                {visibilityEnabled && (
                  <Mui.TableColumnVisibility
                    defaultHiddenColumnNames={defaultHidden}
                    emptyMessageComponent={EmptyMessageComponent}
                  />
                )}
                {(visibilityEnabled || groupingEnabled || allowExport || this.props.toolbarButtons) && (
                  <Mui.Toolbar
                    rootComponent={this.toolbarRootComponent}
                  />
                )}
                {visibilityEnabled && <Mui.ColumnChooser containerComponent={ColumnChooserContainer} messages={{showColumnChooser: "Отобразить выбор колонок"}}/>}
                {allowExport && (
                  <ExportPlugin
                    onClick={this.onExport}
                    tooltip="Выгрузка в Excel"
                    icon={<MuiIcons.CloudDownload/>}
                  />
                )}
                {groupingEnabled && <Mui.GroupingPanel
                  messages={{groupByColumn: "Перетащите заголовок колонки сюда для группировки"}}
                  showGroupingControls={true}
                  showSortingControls={true}
                />}
                {this.props.columnBands && (<Mui.TableBandHeader columnBands={this.props.columnBands}/>)}
                {this.props.toolbarButtons}
                {userSettingsEnabled && (<UserSettingsPlugin onSettingsChange={this.props.onSettingsChange}/>)}
              </Mui.Grid>}
              {this.props.loading && (
                <div className={LOADING_SPIN_WRAPPER}>
                  <Spin
                    tip="Подождите..."
                  />
                </div>
              )}
            </Card>
          </SuiThemeProvider>
        )}
      </SuiThemeContext.Consumer>
    );
  }

  @autobind
  private getSearchComponent(props: Mui.TableFilterRow.CellProps & { disabled?: boolean }): React.ReactNode {
    const column: IBaseTableColLayout = getDataByKey(props, "tableColumn", "column");
    const searchProps = {
      ...props,
      disabled: !props.filteringEnabled || props.disabled,
      ...getDataByKey<INewSearchProps>(column, "search")
    };
    const type: string = searchProps.type;

    if (this.props.customFilterComponent) {
      const customFilter = this.props.customFilterComponent(searchProps, column, type);

      if (customFilter) {
        return customFilter;
      }
    }

    switch (type) {
      case "customSelect":
        return (<CustomSelectFilter {...searchProps} filters={this.props.filters} mode={searchProps.multiple ? "multiple" : undefined}/>);
      case "datetime":
        return (<DatetimeColumnFilter {...searchProps} />);
      case "date":
        return (<DateColumnFilter {...searchProps} />);
      case "boolean":
        return (<BooleanColumnFilter {...searchProps} />);
      case "number":
        return (<NumberIntervalColumnFilter {...searchProps} />);
      case "snils":
        return (<SnilsColumnFilter {...searchProps} />);
      case "oms":
        return (<OmsColumnFilter {...searchProps} />);
      case "inn":
        return (<InnColumnFilter {...searchProps} />);
      case "phone":
        return (<PhoneColumnFilter {...searchProps} />);
      case "none":
        return null;
      default:
        return (<StringColumnFilter {...searchProps}/>);
    }
  }

  @autobind
  private getterComputed({rows}: Getters): any[] {
    this.exportData = rows.map((row: any) => ({...row}));

    return rows;
  }

  @autobind
  private async onExport(getters: Getters): Promise<void> {
    if (this.props.beforeExport) {
      const beforeExportResult = await this.props.beforeExport();

      if (!beforeExportResult) {
        return;
      }
    }

    await exportToXlsx(
      this.props.cols,
      this.exportData,
      {
        exportValueFormatter: this.props.exportValueFormatter,
        file: true,
        hiddenColumnNames: getters.hiddenColumnNames
      }
    );
  }

  @autobind
  private onSelectionChange(selection: TSelection[]): void {
    const newSelection = (this.props.singleSelection || this.props.highlightRow)
      ? selection.filter(element => !this.state.selection.includes(element))
      : selection;

    this.setState(
      {selection: newSelection},
      () => {
        if (this.props.onSelectionChange) {
          this.props.onSelectionChange(newSelection);
        }
      }
    );
  }

  @autobind
  private toolbarRootComponent(props: any): JSX.Element {
    return (
      <ToolbarRoot {...props} style={defaultIfNotBoolean(this.props.toolbarEnabled, true) ? {} : {display: "none"}}>
        {(this.props.warnings && this.props.warnings.length ? [<WarningPlugin messages={this.props.warnings} key={-1}/>] : []).concat([props.children])}
      </ToolbarRoot>
    );
  }

}
