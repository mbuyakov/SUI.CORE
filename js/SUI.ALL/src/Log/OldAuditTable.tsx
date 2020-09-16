import autobind from "autobind-decorator";
import React from 'react';

import {BackendTable} from "../BackendTable";
import {ExtractProps} from "../other";
import {WaitData} from "../WaitData";

export type IOldAuditTableProps =
  Omit<ExtractProps<BackendTable>, "rowDetailComponent" | "table">
  & { table?: string };

export class OldAuditTable extends React.Component<IOldAuditTableProps> {

  public render(): React.ReactNode {
    return (
      <BackendTable
        {...this.props}
        table={this.getTableName()}
        rowDetailComponent={this.rowDetails}
      />
    );
  }

  @autobind
  private getTableName(): string {
    return this.props.table || "audit_log_ui";
  }

  @autobind
  private rowDetails({row}: { row: {id: string} }): JSX.Element {
    return (
      <WaitData<string>
        query={`{
          auditLogById(id: "${row.id}") {
            content
          }
        }`}
        extractKeysLevel={2}
      >
        {(content): JSX.Element => (
          <pre>
            {JSON.stringify(JSON.parse(content || '{}'), null, 2)}
          </pre>
        )}
      </WaitData>
    );
  }
}
