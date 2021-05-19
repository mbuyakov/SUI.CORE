import autobind from "autobind-decorator";
import React from 'react';

// noinspection ES6PreferShortImport
import {BackendTable} from "../BackendTable";
// noinspection ES6PreferShortImport
import {ExtractProps} from "../other";

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
