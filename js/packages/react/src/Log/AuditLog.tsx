// tslint:disable:member-ordering jsx-no-lambda
import {DatePicker, Input, InputNumber, Select} from "antd";
import autobind from "autobind-decorator";
import moment from 'moment';
import React from 'react';
import {TableInfoManager,query,GET_DEFAULT_CALENDAR_RANGES} from "@sui/core";
import {BaseCard} from "../Base";
import {RangePickerValue} from "../compatibleTypes";


import {PromisedButton} from "../Inputs";
import {AuditLogTable, IAuditLogTableProps, IAuditLogTableRow} from "./AuditLogTable";
import {fetchAndFormatAuditLog, fetchTablesWithAuditLogs} from "./utils";

type IAuditLogProps = Omit<IAuditLogTableProps, "rows" | "hideRows" | "extra"> & {
  auditApiUri: string;
}

interface IAuditLogState {
  logByRowIdRows: IAuditLogTableRow[];
  latestLogRows: IAuditLogTableRow[];
  tableInfoOptions: Array<{ value: string, label: string }>;
  logByRowIdValues: {
    tableInfoId?: string;
    rowId?: string;
  },
  latestLogValues: {
    tableInfoId?: string;
    period: RangePickerValue;
    limit?: number;
  },
  notMovedLogCount: number
}

export class AuditLog extends React.Component<IAuditLogProps, IAuditLogState> {

  public constructor(props: IAuditLogProps) {
    super(props);
    this.state = {
      tableInfoOptions: [],
      logByRowIdRows: [],
      logByRowIdValues: {},
      latestLogRows: [],
      latestLogValues: {
        limit: 1000,
        period: [
          moment().startOf('day').subtract(1, 'week'),
          moment().endOf('day')
        ]
      },
      notMovedLogCount: 0
    }
  }

  public async componentDidMount(): Promise<void> {
    const tablesWithAuditLog = await fetchTablesWithAuditLogs(`${this.props.auditApiUri}/tables`);

    this.setState({
      tableInfoOptions: (await TableInfoManager.getAllValues())
        .filter(ti => tablesWithAuditLog.includes(ti.id))
        .map(ti => ({
          value: ti.id,
          label: ti.getNameOrTableName()
        })),
      notMovedLogCount: await query(`{ allAuditLogs { totalCount } }`, 2)
    })
  }

  public render(): React.ReactNode {
    const {auditApiUri, ...tableProps} = this.props;
    const {logByRowIdRows, logByRowIdValues, latestLogRows, latestLogValues} = this.state;

    return (
      <BaseCard
        rows={{
          tabBarExtraContent: `Количество необработанных записей: ${this.state.notMovedLogCount}`,
          tabs: [
            {
              title: "Последние изменения",
              rows: {
                cols: {
                  items: {
                    render: () => (
                      <AuditLogTable
                        {...tableProps}
                        extra={(
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4, max-content)",
                              gap: 8
                            }}
                          >
                            {this.generateTableInfoSelect(latestLogValues.tableInfoId, this.onLatestLogValuesChangeFn("tableInfoId"))}
                            <DatePicker.RangePicker
                              allowClear={false}
                              ranges={GET_DEFAULT_CALENDAR_RANGES()}
                              value={latestLogValues.period}
                              onChange={this.onLatestLogValuesChangeFn("period")}
                            />
                            <InputNumber
                              placeholder="Введите лимит"
                              style={{width: 150}}
                              value={latestLogValues.limit}
                              // tslint:disable-next-line:no-magic-numbers
                              max={50000}
                              onChange={this.onLatestLogValuesChangeFn("limit")}
                            />
                            {this.generateRefreshButton(this.refreshLatestLogValues, !latestLogValues.tableInfoId || !latestLogValues.limit)}
                          </div>
                        )}
                        hideRowId={false}
                        rows={latestLogRows}
                      />
                    )
                  }
                }
              }
            },
            {
              title: "Конкретная запись",
              rows: {
                cols: {
                  items: {
                    render: () => (
                      <AuditLogTable
                        {...tableProps}
                        extra={(
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, max-content)",
                              gap: 8
                            }}
                          >
                            {this.generateTableInfoSelect(logByRowIdValues.tableInfoId, this.onLogByRowIdValuesChangeFn("tableInfoId"))}
                            <Input
                              placeholder="Введите ИД строки"
                              style={{width: 300}}
                              value={logByRowIdValues.rowId}
                              onChange={event => this.onLogByRowIdValuesChangeFn("rowId")(event.target.value)}
                            />
                            {this.generateRefreshButton(this.refreshLogByRowId, !logByRowIdValues.tableInfoId || !logByRowIdValues.rowId)}
                          </div>
                        )}
                        hideRowId={true}
                        rows={logByRowIdRows}
                      />
                    )
                  }
                }
              }
            }
          ]
        }}
      />
    );
  }

  @autobind
  public async refreshLogByRowId(): Promise<void> {
    const {logByRowIdValues} = this.state;

    this.setState({
      logByRowIdRows: await fetchAndFormatAuditLog(`${this.props.auditApiUri}/logs/${logByRowIdValues.tableInfoId}/${logByRowIdValues.rowId}`)
    });
  }

  @autobind
  public async refreshLatestLogValues(): Promise<void> {
    const {latestLogValues} = this.state;

    this.setState({
      latestLogRows: await fetchAndFormatAuditLog(
        `${this.props.auditApiUri}/logs/${latestLogValues.tableInfoId}`,
        {
          params: {
            start: latestLogValues.period[0].clone().startOf('day').format(moment.HTML5_FMT.DATE),
            end: latestLogValues.period[1].clone().add(1, 'day').startOf('day').format(moment.HTML5_FMT.DATE),
            limit: latestLogValues.limit
          }
        }
      )
    });
  }

  @autobind
  private generateRefreshButton(onClick: () => Promise<void>, disabled?: boolean): JSX.Element {
    return (
      <PromisedButton
        type="primary"
        promise={onClick}
        disabled={disabled}
      >
        Обновить
      </PromisedButton>
    );
  }

  @autobind
  private generateTableInfoSelect(value: string | undefined, onChange: (value: string) => void): JSX.Element {
    return (
      <Select
        placeholder="Выберите таблицу"
        optionFilterProp="children"
        showSearch={true}
        style={{width: 300}}
        value={value}
        onChange={onChange}
      >
        {(this.state.tableInfoOptions || []).map(option => (
          <Select.Option key={option.value} value={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select>
    );
  }

  @autobind
  private onLogByRowIdValuesChangeFn(key: keyof IAuditLogState["logByRowIdValues"]): (value: any) => void {
    return value => this.setState({
      logByRowIdValues: {
        ...this.state.logByRowIdValues,
        [key]: value
      }
    })
  }

  @autobind
  private onLatestLogValuesChangeFn(key: keyof IAuditLogState["latestLogValues"]): (value: any) => void {
    return value => this.setState({
      latestLogValues: {
        ...this.state.latestLogValues,
        [key]: value
      }
    })
  }

}
