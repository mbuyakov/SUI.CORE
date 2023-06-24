import autobind from "autobind-decorator";
import React from 'react';
import {IObjectWithIndex, MomentFormat} from '@sui/ui-old-core';

// noinspection ES6PreferShortImport
import {BaseTable} from "../BaseTable";
// noinspection ES6PreferShortImport
import {RouterLink} from "../Link";
// noinspection ES6PreferShortImport
import {ExtractProps} from "../other";
// noinspection ES6PreferShortImport
import {getLinkForTable} from "../utils";

export interface IAuditLogTableRow {
  id: number;
  rowId: string;
  operationType: string;
  userId?: string;
  userName?: string;
  dbUser: string;
  created: string;
  content: Record<string, any>;
}

export type IAuditLogTableProps = Omit<ExtractProps<BaseTable<number>>, "rows" | "cols"> & {
  hideRowId?: boolean;
  rows: IAuditLogTableRow[];
}

export class AuditLogTable extends React.Component<IAuditLogTableProps> {

  public render(): React.ReactNode {
    return (
      <BaseTable<number>
        rowDetailComponent={this.rowDetails}
        {...this.props}
        cols={[
          {
            id: "id",
            title: "ИД",
            width: 120,
            defaultVisible: false,
            defaultSorting: "desc"
          },
          ...(this.props.hideRowId ? [] : [{id: "rowId", title: "ИД записи"}]),
          {
            id: "operationType",
            title: "Тип операции",
            width: 150,
            search: {
              type: "customSelect",
              selectData: [
                {
                  value: "INSERT",
                  title: "Создание"
                },
                {
                  value: "DELETE",
                  title: "Удаление"
                },
                {
                  value: "UPDATE",
                  title: "Изменение"
                }
              ]
            },
            render: (value: string): string => {
              let result: string;

              switch (value) {
                case "INSERT":
                  result = "Создание";
                  break;
                case "DELETE":
                  result = "Удаление";
                  break;
                case "UPDATE":
                  result = "Изменение";
                  break;
                default:
                  result = value;
              }

              return result
            }
          },
          {
            id: "userName",
            title: "Пользователь",
            render: (value: string, row: IObjectWithIndex): JSX.Element => (
              <RouterLink
                to={getLinkForTable("users", "card", row.userId)}
                text={row.userName}
                type="button"
              />
            )
          },
          {
            id: "dbUser",
            title: "Пользователь (БД)"
          },
          {
            id: "created",
            title: "Дата/время операции",
            width: 250,
            search: {type: "date", format: MomentFormat.DATE.f},
            render: MomentFormat.DATETIME.fromUtc,
          },
        ]}
      />
    );
  }

  @autobind
  private rowDetails({row}: { row: IAuditLogTableRow }): JSX.Element {
    return (<pre>{JSON.stringify(row.content, null, 2)}</pre>);
  }

}
