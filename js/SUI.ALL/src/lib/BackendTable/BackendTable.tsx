/* tslint:disable:object-literal-sort-keys no-any unnecessary-else newline-before-return prefer-function-over-method no-floating-promises prefer-readonly promise-function-async*/
import {Filter, Grouping, GroupKey, Sorting, TableFilterRow} from '@devexpress/dx-react-grid';
import autobind from 'autobind-decorator';
import difference from 'lodash/difference';
import moment from "moment";
import * as React from 'react';
import uuid from 'uuid';

import {asyncMap, BaseTable, camelCase, checkCondition, colToBaseTableCol, ColumnInfo, ColumnInfoManager, defaultIfNotBoolean, defaultSelection, getAllowedColumnInfos, getDataByKey, getFiltersFromUrlParam, getFilterType, getUser, IBaseTableColLayout, IBaseTableProps, IGroupSubtotalData, IMetaSettingTableRowColorFormValues, IMetaSettingTableRowColorRowElement, IObjectWithIndex, IRemoteBaseTableFields, isAdmin, isAllowedColumnInfo, ISelectionTable, putFiltersToUrlParam, RefreshMetaTablePlugin, TableInfo, TableInfoManager, TableSettingsDialog, TableSettingsPlugin, WaitData, wrapInArray} from '../index';
import {ClearFiltersPlugin} from "../plugins/ClearFiltersPlugin";

import {BackendDataSource, MESSAGE_ID_KEY} from "./BackendDataSource";
import {RestBackendDataSource} from "./RestBackendDataSource";
import {WsBackendDataSource} from "./WsBackendDataSource";

const IGNORE_WS_ACTUALITY_HOURS = 3;
const LOCAL_STORAGE_IGNORE_WS_KEY = "__SUI_BACKEND_IGNORE_WS";
const DX_REACT_GROUP_SEPARATOR = '|';
const CHILDREN_KEY = '__children';
const RECORDS_KEY = '__records';
const SUBTOTALS_KEY = '__subtotals';

const DELETED_COLUMN = "deleted";

type RequestMessageType =
  'INIT'
  | 'PAGE_CHANGE'
  | 'PAGE_SIZE_CHANGE'
  | 'FILTER_CHANGE'
  | 'SORT_CHANGE'
  | 'GROUPING_CHANGE'
  | 'EXPANDED_GROUP_CHANGE';
type ResponseMessageType = 'DATA' | 'WITHOUT_UPDATE' | 'ERROR';

// Default operation filter = equals
export type SimpleBackendFilter = Omit<Filter, 'value'> & {
  elements?: any[];
  lazy?: boolean;
  raw?: boolean;
  value?: string | string[];
}

export type PredicateType = 'AND' | 'OR' | 'NOT' | string;

export type BackendFilter = {
  filters: BackendFilter[];
  predicate: PredicateType;
} | SimpleBackendFilter;

export type IServiceColumn = Pick<IBaseTableColLayout,
  'id' | 'width' | 'title' | 'dataKey' | 'render' | 'defaultData'>;

export type ICustomFilterProps = Omit<TableFilterRow.CellProps, 'filter' | 'onFilter'> & {
  filter: SimpleBackendFilter | null,
  onFilter(filter: SimpleBackendFilter | null): void
};

export interface IBackendTableProps {
  defaultFilters?: SimpleBackendFilter | SimpleBackendFilter[];
  disableDeletedFilter?: boolean;
  filter?: BackendFilter | BackendFilter[];
  id?: string;
  serviceColumns?: IServiceColumn | IServiceColumn[];
  table: string;
  titleEnabled?: boolean;
  watchFilters?: boolean;
  // Подмена типов для красивого интерфейса
  customFilterComponent?(props: ICustomFilterProps, column: IBaseTableColLayout, type?: string): JSX.Element | null;
}

interface IExpandedGroup {
  key: GroupKey;
  path: string[];
}

type IBackendTableState<T> = {
  cols?: IBaseTableColLayout[];
  // tslint:disable-next-line:no-any
  data?: any[];
  defaultFilters?: SimpleBackendFilter[];
  error?: string;
  lastSendSelection?: T[];
  loading?: boolean;
  pageSize?: number;
  paginationEnabled?: boolean;
  rawMode?: boolean;
  realExpandedGroups?: IExpandedGroup[];
  tableInfo?: TableInfo;
  title?: string;
  warnings?: Array<string | JSX.Element>;
  colorSettingsRowStyler?(row: any): React.CSSProperties;
} & IRemoteBaseTableFields;

function getRowValue(row: any, column: IBaseTableColLayout): any {
  return getDataByKey(row, column.dataKey || column.id);
}

function calculateParentExpandedGroups(realExpandedGroupKeys: IExpandedGroup[], key: GroupKey): IExpandedGroup[] {
  const splittedNewKey = key.split(DX_REACT_GROUP_SEPARATOR);
  const parents: IExpandedGroup[] = [];

  splittedNewKey.slice(0, -1).forEach((_, index) => {
    const parentGroupKey = splittedNewKey.slice(0, index + 1).join(DX_REACT_GROUP_SEPARATOR);
    const parentGroup = realExpandedGroupKeys.find(group => group.key === parentGroupKey);

    if (parentGroup) {
      parents.push(parentGroup);
    }
  });

  return parents;
}

export class BackendTable<TSelection = defaultSelection>
  extends React.Component<Omit<IBaseTableProps<TSelection>, 'rows' | 'cols' | 'defaultFilters' | 'customFilterComponent'> & IBackendTableProps & { innerRef?: React.RefObject<BackendTable<TSelection>> }, IBackendTableState<TSelection>>
  implements ISelectionTable<TSelection> {

  private additionalStateMap: Map<string, IBackendTableState<TSelection>> = new Map<string, IBackendTableState<TSelection>>();
  private backendDataSource: BackendDataSource;
  private baseTableRef: React.RefObject<BaseTable<TSelection>> = React.createRef<BaseTable<TSelection>>();

  public constructor(props: any) {
    super(props);
    const paginationEnabled = defaultIfNotBoolean(this.props.paginationEnabled, true);

    this.state = {
      defaultFilters: (this.props.id && getFiltersFromUrlParam(this.props.id))
        || (this.props.defaultFilters && wrapInArray(this.props.defaultFilters))
        || undefined,
      filters: [],
      lastSendSelection: [],
      paginationEnabled,
      // tslint:disable-next-line:no-magic-numbers
      pageSize: paginationEnabled ? (this.props.pageSize || 10) : 1000000000
    };
  }

  @autobind
  public clearFilters(): Promise<void> {
    return new Promise<void>((resolve): void => {
      this.onFiltersChange([]);
      resolve();
    });
  }

  @autobind
  public clearSelection(): void {
    return this.baseTableRef
      && this.baseTableRef.current
      && this.baseTableRef.current.clearSelection();
  }

  public componentDidMount(): void {
    this.updateMetaData().then(this.initDataSource);
    this.setInnerRefValue(this);
  }

  public async componentDidUpdate(prevProps: IBackendTableProps): Promise<void> {
    if (this.props.watchFilters) {
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      const isEquals = (first, second): boolean => JSON.stringify(first) === JSON.stringify(second);

      const filtersChanged = !isEquals(this.props.filter, prevProps.filter);

      if (filtersChanged) {
        await this.reinit();
      }

      // Опасно: можно потерять фильтры из URL
      const defaultFiltersChanged = !isEquals(this.props.defaultFilters, prevProps.defaultFilters);

      if (defaultFiltersChanged) {
        this.setState(
          {defaultFilters: this.props.defaultFilters && wrapInArray(this.props.defaultFilters) || undefined},
          () => this.reinit()
        );
      }
    }
  }

  public componentWillUnmount(): void {
    this.setInnerRefValue(undefined);
    if (this.backendDataSource) {
      this.backendDataSource.disconnect();
    }
  }

  @autobind
  public getData(): any[] {
    return this.state && this.state.data || [];
  }

  @autobind
  public getSelection(): TSelection[] {
    return this.baseTableRef
      && this.baseTableRef.current
      && this.baseTableRef.current.getSelection() || [];
  }

  @autobind
  public refresh(): Promise<void> {
    // nothing changing message
    return new Promise<void>((resolve): void => {
      this.onPageSizeChange(this.state.pageSize);
      resolve();
    });
  }

  @autobind
  public async reinit(): Promise<void> {
    await this.updateMetaData();
    await this.resendInitMessage();
  }

  public render(): JSX.Element {
    const admin = isAdmin();

    return (
      <WaitData
        data={this.state.cols}
        error={!!this.state.error}
        errorTip={this.state.error}
        hideChildren={!(this.state.cols)}
        alwaysUpdate={true}
      >
        <BaseTable<TSelection>
          {...this.props}
          {...this.state}
          defaultFilters={undefined}
          cols={this.state.cols || []}
          rows={this.state.data}
          ref={this.baseTableRef}
          title={this.props.title || this.state.title}
          paperStyle={{
            borderBottom: this.state.paginationEnabled ? undefined : 0,
            ...this.props.paperStyle
          }}
          noColsContent={
            admin && (
              <TableSettingsDialog
                id={this.state.tableInfo && this.state.tableInfo.id}
                style={{
                  height: 0,
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
                buttonStyle={{
                  margin: 16,
                  height: 48,
                }}
              />
            )
          }
          toolbarButtons={[
            (<ClearFiltersPlugin handleClick={this.clearFilters}/>),
            (<RefreshMetaTablePlugin handleClick={this.refresh}/>),
            // admin && (<RawModePlugin enabled={this.state.rawMode} onClick={this.changeRaw}/>),
            admin && (<TableSettingsPlugin id={this.state.tableInfo && this.state.tableInfo.id}/>)
          ].filter(Boolean)}
          rowStyler={this.generateRowStyler()}
          warnings={admin ? this.state.warnings : undefined}
          // tslint:disable-next-line:no-magic-numbers
          pageSizes={[10, 25, 50]}
          // remote functions
          getChildGroups={this.getChildGroups}
          onCurrentPageChange={this.onCurrentPageChange}
          onExpandedGroupsChange={this.onExpandedGroupsChange}
          onFiltersChange={this.onFiltersChange}
          onGroupingChange={this.onGroupingChange}
          onPageSizeChange={this.onPageSizeChange}
          onSortingChange={this.onSortingChange}
        />
      </WaitData>
    );
  }

  @autobind
  private changeRaw(): void {
    this.setState({rawMode: !this.state.rawMode}); // , this.updateData);
  }

  @autobind
  private collectGroupSubtotalData(
    resultMap: Map<GroupKey, IGroupSubtotalData>,
    currentRows: any[] | null,
    groupingFields: string[],
    keyPrefix: string,
  ): void {
    if (groupingFields && groupingFields.length > 0) {
      const keyField = groupingFields[0];
      const nestedGroupingFields = groupingFields.slice(1);

      (currentRows || []).forEach(row => {
        const compoundKey = `${keyPrefix}${row[keyField]}`;
        resultMap.set(compoundKey, {
          elements: row[RECORDS_KEY],
          data: row[SUBTOTALS_KEY],
        });
        this.collectGroupSubtotalData(
          resultMap,
          row[CHILDREN_KEY] || [],
          nestedGroupingFields,
          `${compoundKey}${DX_REACT_GROUP_SEPARATOR}`,
        );
      });
    }
  }

  @autobind
  private findColumnInfoByCamelCaseName(camelCaseColumnName: string): ColumnInfo {
    const tableInfo = this.state.tableInfo;
    return tableInfo
      ? tableInfo.directGetColumns().find(columnInfo => camelCase(columnInfo.columnName) === camelCase(camelCaseColumnName))
      : null;
  }

  @autobind
  private findColumnInfoByName(name: string): ColumnInfo {
    const tableInfo = this.state.tableInfo;
    return tableInfo
      ? tableInfo.directGetColumns().find(columnInfo => columnInfo.columnName === name)
      : null;
  }

  @autobind
  private generateRowStyler(): (row: any) => React.CSSProperties {
    const stylers = [this.state.colorSettingsRowStyler, this.props.rowStyler].filter(Boolean);

    if (stylers.length) {
      return (row): React.CSSProperties => stylers.reduce((result, styler) => ({...result, ...styler(row)}), {});
    }

    return undefined;
  }

  @autobind
  private getChildGroups(currentRows: any[], grouping: Grouping): Array<{ childRows?: any[], key: number | string, value?: any }> {
    const groupRowField = this.getGroupRowField(grouping);

    return currentRows.map(currentRow => ({
      key: currentRow[groupRowField],
      value: currentRow[groupRowField],
      childRows: currentRow[CHILDREN_KEY] || [],
    }));
  }

  @autobind
  private getGroupRowField(grouping: Grouping): string {
    let groupRowField = grouping.columnName;

    const groupingColumnInfo = this.findColumnInfoByName(grouping.columnName);
    const references = groupingColumnInfo && groupingColumnInfo.foreignColumnInfo;

    if (references.length > 0) {
      const referencedColumnInfo = ColumnInfoManager.directGetById(references[0]);
      const referencedTableInfo = TableInfoManager.directGetById(referencedColumnInfo.tableInfoId);

      if (referencedTableInfo.foreignLinkColumnInfoId && referencedColumnInfo.id !== referencedTableInfo.foreignLinkColumnInfoId) {
        groupRowField = `${groupRowField}__name`;
      }
    }

    return groupRowField;
  }

  @autobind
  // this.backendDataSource должно быть присвоено до вызова init()
  private async initDataSource(): Promise<void> {
    let shouldIgnoreWS = this.shouldIgnoreWS();

    if (!shouldIgnoreWS) {
      this.backendDataSource = new WsBackendDataSource(this.onOpen, this.onMessage);

      if (!(await this.backendDataSource.init())) {
        shouldIgnoreWS = true;
        localStorage.setItem(LOCAL_STORAGE_IGNORE_WS_KEY, moment().toISOString());
      }
    }

    if (shouldIgnoreWS) {
      this.backendDataSource = new RestBackendDataSource(this.onOpen, this.onMessage);
      await this.backendDataSource.init();
    }
  }

  @autobind
  private mapFilters(filters: BackendFilter[], includeRaw: boolean = false): any[] {
    return (filters || [])
      .map((filter: any) => {
        if (filter.predicate) {
          return {
            ...filter,
            filters: this.mapFilters(filter.filters || []),
          };
        } else {
          return (filter.elements || (filter.value !== undefined && filter.value !== ''))
            ? this.normalizeColumnName({
              ...filter,
              raw: includeRaw ? defaultIfNotBoolean(filter.raw, true) : filter.raw,
            }) : null;
        }
      }).filter(filter => filter);
  }

  @autobind
  private normalizeColumnName<T extends {columnName: string}>(element: T): T {
    return {
      ...element,
      columnName: getDataByKey<string>(
        this.findColumnInfoByName(element.columnName) || this.findColumnInfoByCamelCaseName(element.columnName),
        "columnName"
      )
    }
  }

  @autobind
  private onCurrentPageChange(currentPage: number): void {
    const content = {currentPage};
    // noinspection JSIgnoredPromiseFromCall
    this.sendMessage('PAGE_CHANGE', content, content);
  }

  @autobind
  private onError(message: IObjectWithIndex): void {
    this.setState({error: message.message, loading: false});
  }

  @autobind
  private onExpandedGroupsChange(expandedGroups: GroupKey[]): void {
    const stateExpandedGroups = this.state.expandedGroups || [];
    const newKeys: GroupKey[] = difference(expandedGroups, stateExpandedGroups);
    const deletedKeys: GroupKey[] = difference(stateExpandedGroups, expandedGroups);
    const realExpandedGroups = (this.state.realExpandedGroups || []).filter(element => !deletedKeys.includes(element.key));

    newKeys.forEach(newKey => {
      const parents = calculateParentExpandedGroups(realExpandedGroups, newKey);
      let path;

      if (parents.length) {
        const lastParentPath = parents[parents.length - 1].path;
        path = lastParentPath.concat(
          newKey.substr(lastParentPath.join(DX_REACT_GROUP_SEPARATOR).length + DX_REACT_GROUP_SEPARATOR.length),
        );
      } else {
        path = [newKey];
      }

      realExpandedGroups.push({
        key: newKey,
        path,
      });
    });

    // noinspection JSIgnoredPromiseFromCall
    this.sendMessage(
      'EXPANDED_GROUP_CHANGE',
      {
        expandedGroups: expandedGroups
          .map(groupKey => realExpandedGroups.find(realGroup => realGroup.key === groupKey))
          .filter(group => {
            const parents = calculateParentExpandedGroups(realExpandedGroups, group.key);
            return (parents.length + 1) === group.path.length;
          })
          .filter((group, _, groups) => {
            const groupKeyPrefix = `${group.key}${DX_REACT_GROUP_SEPARATOR}`;
            return groups.every(element => !element.key.startsWith(groupKeyPrefix));
          })
          .map(expandedGroup => ({group: expandedGroup.path})),
      },
      {
        customGrouping: this.state.grouping,
        customExpandedGroups: this.state.customExpandedGroups,
        expandedGroups,
        realExpandedGroups,
      },
      {customExpandedGroups: null, customGrouping: null},
    );
  }

  @autobind
  private onFiltersChange(filters: SimpleBackendFilter[]): void {
    const stateFiltersAsString = (this.state.filters || []).map(filter => JSON.stringify(filter));
    const newFilters = filters.filter(filter => !stateFiltersAsString.includes(JSON.stringify(filter)));

    if (newFilters.some(filter => !filter.lazy)) {
      if (this.props.id) {
        putFiltersToUrlParam(this.props.id, filters);
      }

      // noinspection JSIgnoredPromiseFromCall
      this.sendMessage(
        'FILTER_CHANGE',
        {
          filters: this.mapFilters(filters),
        },
        {filters},
      );
    } else {
      // TODO: Высокоуровневый костыль, чтобы не рефрешить state, работает на честном слове
      // Если что-то сломается, то это первый кандидат
      while (this.state.filters.length) { this.state.filters.pop() }
      filters.forEach(filter => this.state.filters.push(filter));
    }
  }

  @autobind
  private onGroupingChange(groupings: Grouping[]): void {
    // noinspection JSIgnoredPromiseFromCall
    this.sendMessage(
      'GROUPING_CHANGE',
      {groupings},
      {grouping: groupings, customGrouping: this.state.grouping, customExpandedGroups: this.state.customExpandedGroups},
      {customGrouping: null, customExpandedGroups: null},
    );
  }

  @autobind
  private onMessage(message: IObjectWithIndex): void {
    const type: ResponseMessageType = message.type;

    if (type === 'ERROR') {
      this.onError(message);
    } else {
      const messageId = message[MESSAGE_ID_KEY];

      if (type === 'DATA') {
        const messageData = message as { currentPage: number, data: any[], totalCount: number };

        let groupSubtotalData;
        if (this.state.grouping && this.state.grouping.length > 0) {
          groupSubtotalData = new Map<GroupKey, IGroupSubtotalData>();

          this.collectGroupSubtotalData(
            groupSubtotalData,
            messageData.data,
            this.state.grouping.map(this.getGroupRowField),
            ''
          );
        }

        this.setState({
          ...this.additionalStateMap.get(messageId),
          data: messageData.data,
          totalCount: messageData.totalCount,
          currentPage: messageData.currentPage,
          loading: false,
          groupSubtotalData,
        });
      }

      this.additionalStateMap.delete(messageId);
    }
  }

  @autobind
  private onOpen(): void {
    this.sendInitMessage(this.state.tableInfo);
  }

  @autobind
  private onPageSizeChange(pageSize: number): void {
    // noinspection JSIgnoredPromiseFromCall
    this.sendMessage('PAGE_SIZE_CHANGE', {pageSize}, {pageSize});
  }

  @autobind
  private onSortingChange(sorting: Sorting[]): void {
    const newState = {sorting};
    const prevSorting = this.state.sorting || [];

    let shouldNotUpdate = false;

    if (sorting.length > prevSorting.length) {
      const newSorting = sorting.filter(sort => !prevSorting.find(prevSort => prevSort.columnName === sort.columnName));
      shouldNotUpdate = newSorting.every(sort => (this.state.grouping || []).find(grouping => grouping.columnName === sort.columnName))
    }

    if (shouldNotUpdate) {
      this.setState(newState);
    } else {
      // noinspection JSIgnoredPromiseFromCall
      this.sendMessage(
        'SORT_CHANGE',
        {
          sorts: sorting.map(sort => ({
            columnName: sort.columnName,
            direction: sort.direction.toUpperCase(),
          })),
        },
        newState);
    }
  }

  @autobind
  private async resendInitMessage(): Promise<void> {
    return this.sendInitMessage(this.state.tableInfo, {
      data: [],
      expandedGroups: [],
      filters: this.mapFilters(this.state.defaultFilters || []),
      groupSubtotalData: new Map<GroupKey, IGroupSubtotalData>(),
    });
  }

  @autobind
  private async sendInitMessage(tableInfo: TableInfo, additionalState?: IBackendTableState<TSelection>): Promise<void> {
    if (tableInfo) {
      // TODO: Сейчас надо как-то дождатьзя загрузки инфы колонок что бы получить возможность тыкаться в directGetById. Куда ещё положить - не придумал
      await ColumnInfoManager.getAllValues();
      const content = {
        // tslint:disable-next-line:no-magic-numbers
        pageSize: this.state.pageSize,
        currentPage: 0
      };
      const sortedColumns = await getAllowedColumnInfos(tableInfo, getUser().roles);
      let defaultFilters = this.mapFilters(this.state.defaultFilters || [], true);

      if (!this.props.disableDeletedFilter && sortedColumns.find(column => column.columnName === DELETED_COLUMN)) {
        defaultFilters = [
          ...defaultFilters,
          {
            columnName: DELETED_COLUMN,
            value: "false",
            raw: true
          }
        ]
      }

      // noinspection JSIgnoredPromiseFromCall
      this.sendMessage(
        'INIT',
        {
          ...content,
          tableInfoId: tableInfo.id,
          defaultFilters,
          globalFilters: this.mapFilters(
            this.props.filter && wrapInArray(this.props.filter) || [],
            true,
          ),
        },
        {
          ...content,
          sorting: sortedColumns
            .filter(columnInfo => columnInfo.defaultSorting)
            .map(columnInfo => ({
              columnName: columnInfo.columnName,
              direction: columnInfo.defaultSorting as 'asc' | 'desc',
            })),
          grouping: sortedColumns
            .filter(columnInfo => columnInfo.defaultGrouping)
            .map(columnInfo => ({columnName: columnInfo.columnName,})),
          filters: defaultFilters,
          ...additionalState,
        });
    }
  }

  @autobind
  private async sendMessage(
    type: RequestMessageType,
    content: any,
    newState: IBackendTableState<TSelection>,
    additionalState?: IBackendTableState<TSelection>,
  ): Promise<void> {
    const messageId = uuid.v4();
    if (additionalState) {
      this.additionalStateMap.set(messageId, additionalState);
    }

    let selection = null;

    if (this.backendDataSource) {
      const messageContent: any = {content, type};

      if (this.props.selectionEnabled) {
        selection = this.getSelection() || [];
        const sortedStringifiedSelection = selection.map(String).sort();
        const sortedStringifiedLastSelection = (this.state.lastSendSelection || []).map(String).sort();

        if (sortedStringifiedSelection.length !== sortedStringifiedLastSelection.length
          || !sortedStringifiedSelection.every((element, index) => element === sortedStringifiedLastSelection[index])) {
          messageContent.selection = selection;
        }
      }

      await this.backendDataSource.send(messageId, messageContent);
    }

    this.setState({loading: true, ...newState, ...(selection ? {lastSendSelection: selection} : null)});
  }

  @autobind
  private setInnerRefValue(value?: BackendTable<TSelection>): void {
    if (this.props.innerRef) {
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      this.props.innerRef.current = value;
    }
  }

  @autobind
  private shouldIgnoreWS(): boolean {
    const ignoreWsItem = localStorage.getItem(LOCAL_STORAGE_IGNORE_WS_KEY);
    return ignoreWsItem && moment().diff(moment(ignoreWsItem), "hours") < IGNORE_WS_ACTUALITY_HOURS;
  }

  @autobind
  private async updateMetaData(): Promise<void> {
    const tableInfo = await TableInfoManager.getById(this.props.table);

    if (tableInfo) {
      // title
      if (this.state.rawMode || this.props.titleEnabled) {
        let title = tableInfo.getNameOrTableName();
        if (this.state.rawMode) {
          title += ` (${tableInfo.schemaName}.${tableInfo.tableName})`;
        }
        this.setState({title});
      }
      if (this.state.title && !(this.state.rawMode || this.props.titleEnabled)) {
        this.setState({title: null});
      }

      const cols = await tableInfo.getColumns();
      const roles = getUser().roles || [];
      const allowedCols = await asyncMap(
        cols.filter(col => isAllowedColumnInfo(col, roles)),
        columnInfo => colToBaseTableCol({
          tableInfo,
          columnInfo,
          roles,
          rawMode: this.state.rawMode,
          isLinkCol: tableInfo.linkColumnInfoId === columnInfo.id,
        }),
      );

      // Warnings
      const warnings = [];
      if (!tableInfo.nameId) {
        warnings.push('Не задано имя таблицы');
      }
      if (!tableInfo.linkColumnInfoId) {
        warnings.push('Не задано поле ссылки на форме списка');
      }
      cols.forEach(col => {
        if (!col.nameId) {
          warnings.push(`Не задано имя для колонки ${col.columnName}`);
        }
      });

      let colorSettingsRowStyler = null;

      if (tableInfo.colorSettings) {
        const colorSettings: IMetaSettingTableRowColorFormValues = JSON.parse(tableInfo.colorSettings);

        if (colorSettings.color) {
          const checkDnf = colorSettings.forms.map(andSettingBlock => andSettingBlock.map(setting => {
            const [firstColumnInfoSetting, secondColumnInfoSetting] =
              (['firstColumnInfoId', 'secondColumnInfoId'] as Array<keyof IMetaSettingTableRowColorRowElement>)
                .map(name => {
                  const column = setting[name] && cols.find(col => col.id === setting[name]);
                  let baseTableColLayout;

                  if (column) {
                    baseTableColLayout = allowedCols.find(col => col.id === column.columnName);
                  }

                  return {
                    column,
                    baseTableColLayout,
                  };
                });

            if (firstColumnInfoSetting.baseTableColLayout && (setting.constant || secondColumnInfoSetting.baseTableColLayout)) {
              return (row: any): boolean => checkCondition(
                setting.action,
                setting.constant ? getFilterType(firstColumnInfoSetting.column, setting.action) : null,
                getRowValue(row, firstColumnInfoSetting.baseTableColLayout),
                setting.constant ? setting.simpleFilter : getRowValue(row, secondColumnInfoSetting.baseTableColLayout),
              );
            }

            return (): boolean => false;
          }));

          colorSettingsRowStyler = (row: any): React.CSSProperties => {
            const isValid = checkDnf.some(andChecks => andChecks.every(check => check(row)));

            return isValid ? {backgroundColor: colorSettings.color} : undefined;
          };
        }
      }

      const serviceColumns = (this.props.serviceColumns ? wrapInArray(this.props.serviceColumns) : [])
        // tslint:disable-next-line:no-object-literal-type-assertion
        .map(serviceColumn => ({
          ...serviceColumn,
          exportable: false,
          groupingEnabled: false,
          sortingEnabled: false,
          search: {type: 'none'},
        } as IBaseTableColLayout));

      this.setState({
        cols: serviceColumns.concat(allowedCols),
        tableInfo,
        colorSettingsRowStyler,
        warnings,
      });
    }
  }

}
