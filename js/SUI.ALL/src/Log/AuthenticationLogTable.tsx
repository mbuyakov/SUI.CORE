import autobind from "autobind-decorator";
import React from 'react';

import {BackendTable} from "../BackendTable";
import {ExtractProps} from "../other";


export type IAuthenticationLogTableProps = Omit<ExtractProps<BackendTable>, "table"> & { table?: string };

export class AuthenticationLogTable extends React.Component<IAuthenticationLogTableProps> {

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
    return this.props.table || "authentication_log_ui";
  }

}
