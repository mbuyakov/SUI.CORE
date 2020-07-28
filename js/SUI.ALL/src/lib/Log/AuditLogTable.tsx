// tslint:disable:member-ordering jsx-no-lambda
import autobind from "autobind-decorator";
import moment from 'moment';
import React from 'react';
import {BaseTable} from "../BaseTable";
import {RouterLink} from "../Link";
import {ExtractProps, IObjectWithIndex} from "../other";
import {getLinkForTable} from "../utils";

export interface IAuditLogTableRow {
  id: number;
  rowId: string;
  operationType: string;
  userId?: string;
  userName?: string;
  dbUser: string;
  created: string;
}

export type IAuditLogTableProps = Omit<ExtractProps<BaseTable>, "rows" | "cols" | "rowDetailComponent"> & {
  hideRowId?: boolean;
  rows: IAuditLogTableRow[];
}

export class AuditLogTable extends React.Component<IAuditLogTableProps> {

  public render(): React.ReactNode {
    return (
      <BaseTable
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
            render: (value: string, row: IObjectWithIndex) => (
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
            search: {type: "date"},
            render: (created: string | undefined) => created ? moment(created).format("DD.MM.YYYY HH:mm:ss") : created
          },
        ]}
        rowDetailComponent={this.rowDetails}
      />
    );
  }

  @autobind
  private rowDetails({row}: { row: { content: object } }): JSX.Element {
    return (<pre>{JSON.stringify(row.content, null, 2)}</pre>);
  }

}
