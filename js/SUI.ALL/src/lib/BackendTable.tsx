/* tslint:disable:object-literal-sort-keys no-any unnecessary-else newline-before-return prefer-function-over-method no-floating-promises prefer-readonly promise-function-async*/
import {Filter, Grouping, GroupKey, Sorting, TableFilterRow} from '@devexpress/dx-react-grid';
import {IFrame, IMessage} from '@stomp/stompjs';
import autobind from 'autobind-decorator';
import difference from 'lodash/difference';
import * as React from 'react';
import uuid from 'uuid';

import {asyncMap, BaseTable, camelCase, checkCondition, colToBaseTableCol, ColumnInfo, ColumnInfoManager, defaultIfNotBoolean, defaultSelection, getAllowedColumnInfos, getBackendUrl, getDataByKey, getFilterType, getUser, IBaseTableColLayout, IBaseTableProps, IGroupSubtotalData, IMetaSettingTableRowColorFormValues, IMetaSettingTableRowColorRowElement, IRemoteBaseTableFields, isAdmin, isAllowedColumnInfo, ISelectionTable, RefreshMetaTablePlugin, Socket, TableInfo, TableInfoManager, TableSettingsDialog, TableSettingsPlugin, WaitData, wrapInArray} from './index';

const SUBSCRIBE_DESTINATION_PREFIX = '/user/queue/response/';
const SEND_DESTINATION = '/data';
const messageIdKey = '__messageId';

const DX_REACT_GROUP_SEPARATOR = '|';
const CHILDREN_KEY = '__children';
const RECORDS_KEY = '__records';
const SUBTOTALS_KEY = '__subtotals';

const DELETED_COLUMN = "deleted";

const RECONNECT_DELAY = 50;

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
  raw?: boolean;
} & {
  value?: string | string[]
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
  error?: string;
  lastSendSelection?: T[];
  loading?: boolean;
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
  extends React.Component<Omit<IBaseTableProps<TSelection>, 'rows' | 'cols' | 'defaultFilters' | 'customFilterComponent'> & IBackendTableProps & { innerRef?: React.RefObject<BackendTable> }, IBackendTableState<TSelection>>
  implements ISelectionTable<TSelection> {

  private additionalStateMap: Map<string, IBackendTableState<TSelection>> = new Map<string, IBackendTableState<TSelection>>();
  private baseTableRef: React.RefObject<BaseTable<TSelection>> = React.createRef<BaseTable<TSelection>>();
  private initialSessionId: string;
  private socket: Socket;

  public constructor(props: any) {
    super(props);
    const paginationEnabled = defaultIfNotBoolean(this.props.paginationEnabled, true);

    this.state = {
      lastSendSelection: [],
      paginationEnabled,
      // tslint:disable-next-line:no-magic-numbers
      pageSize: paginationEnabled ? undefined : 1000000000
    };
  }

  @autobind
  public clearSelection(): void {
    return this.baseTableRef
      && this.baseTableRef.current
      && this.baseTableRef.current.clearSelection();
  }

  public componentDidMount(): void {
    this.updateMetaData().then(this.createWebSocket);
    this.setInnerRefValue(this);
  }

  public async componentDidUpdate(prevProps: IBackendTableProps): Promise<void> {
    if (this.props.watchFilters) {
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      const isEquals = (first, second): boolean => JSON.stringify(first) === JSON.stringify(second);

      if (!isEquals(this.props.defaultFilters, prevProps.defaultFilters) || !isEquals(this.props.filter, prevProps.filter)) {
        return this.reinit();
      }
    }
  }

  public componentWillUnmount(): void {
    this.setInnerRefValue(undefined);
    if (this.socket) {
      this.socket.disconnect();
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
          defaultFilters={this.props.defaultFilters ? wrapInArray(this.props.defaultFilters) : undefined}
          {...this.state}
          paperStyle={{
            borderBottom: this.state.paginationEnabled ? undefined : 0,
            ...this.props.paperStyle
          }}
          filters={this.state.filters ? this.state.filters.map(filter => ({...filter, columnName: camelCase(filter.columnName)})) : undefined}
          rows={this.state.data}
          cols={this.state.cols}
          ref={this.baseTableRef}
          title={this.props.title || this.state.title}
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
            (<RefreshMetaTablePlugin handleClick={this.reinit}/>),
            // admin && (<RawModePlugin enabled={this.state.rawMode} onClick={this.changeRaw}/>),
            admin && (<TableSettingsPlugin id={this.state.tableInfo && this.state.tableInfo.id}/>),
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
  private createWebSocket(): void {
    const backendURL = new URL(getBackendUrl());

    this.socket = new Socket({
      brokerURL: backendURL.toString(),
      reconnectDelay: RECONNECT_DELAY,
      connectHeaders: {Authorization: `Bearer ${getUser().accessToken}`},
      onConnect: (frame: IFrame): void => {
        const alreadyInitiated = !!this.initialSessionId;
        const client = this.socket.getClient();

        console.log(client);

        if (!alreadyInitiated) {
          this.initialSessionId = frame.body;
        }

        client.subscribe(`${SUBSCRIBE_DESTINATION_PREFIX}${this.initialSessionId}`, this.onMessage);

        if (!alreadyInitiated) {
          this.onOpen();
        }

        // Add new parameter to connection URL for reconnection
        backendURL.searchParams.set("previousSessionId", frame.body);
        client.brokerURL = backendURL.toString();
      }
    });
  }

  @autobind
  private findColumnInfoByCamelCaseName(camelCaseColumnName: string): ColumnInfo {
    const tableInfo = this.state.tableInfo;
    return tableInfo
      ? tableInfo.directGetColumns().find(columnInfo => camelCase(columnInfo.columnName) === camelCase(camelCaseColumnName))
      : null;
  }

  @autobind
  private findPascalCaseColumnName(camelCaseColumnName: string): string {
    const resultColumnInfo = this.findColumnInfoByCamelCaseName(camelCaseColumnName);
    return resultColumnInfo && resultColumnInfo.columnName;
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

    const groupingColumnInfo = this.findColumnInfoByCamelCaseName(grouping.columnName);
    const references = groupingColumnInfo && groupingColumnInfo.foreignColumnInfo;

    if (references.length > 0) {
      const referencedColumnInfo = ColumnInfoManager.directGetById(references[0]);
      const referencedTableInfo = TableInfoManager.directGetById(referencedColumnInfo.tableInfoId);

      if (referencedTableInfo.foreignLinkColumnInfoId && referencedColumnInfo.id !== referencedTableInfo.foreignLinkColumnInfoId) {
        groupRowField = `${groupRowField}Name`;
      }
    }

    return groupRowField;
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
            ? {
              ...filter,
              operation: filter.operation,
              columnName: this.findPascalCaseColumnName(filter.columnName),
              raw: includeRaw ? defaultIfNotBoolean(filter.raw, true) : filter.raw,
            } : null;
        }
      }).filter(filter => filter);
  }

  @autobind
  private onCurrentPageChange(currentPage: number): void {
    const content = {currentPage};
    // noinspection JSIgnoredPromiseFromCall
    this.sendMessage('PAGE_CHANGE', content, content);
  }

  @autobind
  private onError(message: IMessage): void {
    const parsedBody = JSON.parse(message.body || '{}');
    console.error(parsedBody);
    this.setState({error: parsedBody.message, loading: false});
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
    // noinspection JSIgnoredPromiseFromCall
    this.sendMessage(
      'FILTER_CHANGE',
      {
        filters: this.mapFilters(filters),
      },
      {filters},
    );
  }

  @autobind
  private onGroupingChange(groupings: Grouping[]): void {
    // noinspection JSIgnoredPromiseFromCall
    this.sendMessage(
      'GROUPING_CHANGE',
      {groupings: groupings.map(grouping => ({columnName: this.findPascalCaseColumnName(grouping.columnName)}))},
      {grouping: groupings, customGrouping: this.state.grouping, customExpandedGroups: this.state.customExpandedGroups},
      {customGrouping: null, customExpandedGroups: null},
    );
  }

  @autobind
  private onMessage(message: IMessage): void {
    const parsedMessage = JSON.parse(message.body);
    const type: ResponseMessageType = parsedMessage.type;

    console.log(parsedMessage);

    if (type === 'ERROR') {
      this.onError(message);
    } else {
      const messageId = parsedMessage[messageIdKey];

      if (type === 'DATA') {
        const messageData: { currentPage: number, data: any[], totalCount: number } = parsedMessage;

        let groupSubtotalData;
        if (this.state.grouping && this.state.grouping.length > 0) {
          groupSubtotalData = new Map<GroupKey, IGroupSubtotalData>();

          this.collectGroupSubtotalData(
            groupSubtotalData,
            messageData.data,
            this.state.grouping.map(this.getGroupRowField),
            '');
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
            columnName: this.findPascalCaseColumnName(sort.columnName),
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
      filters: this.mapFilters(this.props.defaultFilters && wrapInArray(this.props.defaultFilters) || []),
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
        pageSize: this.state.paginationEnabled ? 10 : this.state.pageSize,
        currentPage: 0
      };
      const sortedColumns = await getAllowedColumnInfos(tableInfo, getUser().roles);
      let defaultFilters = this.mapFilters(
        this.props.defaultFilters && wrapInArray(this.props.defaultFilters) || [],
        true,
      );

      if (!this.props.disableDeletedFilter && sortedColumns.find(column => column.columnName === DELETED_COLUMN)) {
        defaultFilters = [
          ...defaultFilters,
          {
            columnName: DELETED_COLUMN,
            value: "true",
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
              columnName: camelCase(columnInfo.columnName),
              direction: columnInfo.defaultSorting as 'asc' | 'desc',
            })),
          grouping: sortedColumns
            .filter(columnInfo => columnInfo.defaultGrouping)
            .map(columnInfo => ({
              columnName: camelCase(columnInfo.columnName),
            })),
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

    if (this.socket) {
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

      await this.socket.send({
        destination: SEND_DESTINATION,
        headers: {[messageIdKey]: messageId},
        body: JSON.stringify(messageContent)
      });
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
                  let columnCamelCaseName: string;
                  let baseTableColLayout;

                  if (column) {
                    columnCamelCaseName = camelCase(column.columnName);
                    baseTableColLayout = allowedCols.find(col => col.id === columnCamelCaseName);
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
