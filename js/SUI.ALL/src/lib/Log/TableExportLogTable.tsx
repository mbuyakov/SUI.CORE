import autobind from "autobind-decorator";
import React from 'react';

import {BackendTable} from "../BackendTable";
import {ExtractProps} from "../other";
import {WaitData} from "../WaitData";

export type ITableExportLogTableProps = Omit<ExtractProps<BackendTable>, "table"> & { table?: string };

export class TableExportLogTable extends React.Component<ITableExportLogTableProps> {

  public render(): React.ReactNode {
    return (
      <BackendTable
        {...this.props}
        table={this.getTableName()}
      />
    );
  }

  @autobind
  private getTableName(): string {
    return this.props.table || "table_export_log_ui";
  }

}
