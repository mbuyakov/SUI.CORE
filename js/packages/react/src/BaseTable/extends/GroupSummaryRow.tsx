/* eslint-disable @typescript-eslint/no-explicit-any */
import {Getter, Plugin, Template} from "@devexpress/dx-react-core";
import {GroupKey, TableRow as TableRowProps} from "@devexpress/dx-react-grid";
import {Table} from "@devexpress/dx-react-grid-material-ui";
import autobind from "autobind-decorator";
import * as React from "react";
import {NO_DATA_TEXT, stringSymbolEquals} from '@sui/core';
import {IBaseTableColLayout, IGroupSubtotalData} from '../types';


const SUMMARY_KEY_PREFIX = "summary__";

interface IGroupSummaryRowProps {
  subtotalData?: Map<GroupKey, IGroupSubtotalData>;
}

export class GroupSummaryRow extends React.Component<IGroupSummaryRowProps> {

  private static isSummaryRow(params: { tableRow: TableRowProps }): boolean {
    return stringSymbolEquals("summary", params.tableRow && params.tableRow.type);
  }

  private static tableBodyRowsComputed(getters: { expandedGroups: GroupKey[], tableBodyRows?: TableRowProps[] }): TableRowProps[] {
    return (getters.tableBodyRows || []).reduce((acc, row) => {
      acc.push(row);
      if (stringSymbolEquals("group", row.type)
        && getters.expandedGroups.includes(row.row.compoundKey)) {
        acc.push({
          key: `${SUMMARY_KEY_PREFIX}${row.row.compoundKey}`,
          type: Symbol("summary")
        });
      }

      return acc;
    }, [] as TableRowProps[]);
  }

  public render(): JSX.Element {
    return (
      <Plugin>
        <Getter
          name="tableBodyRows"
          computed={GroupSummaryRow.tableBodyRowsComputed as any}
        />
        <Template
          name="tableCell"
          predicate={GroupSummaryRow.isSummaryRow as any}
        >
          {(cellProps: Table.DataCellProps): JSX.Element => {
            const column = cellProps.tableColumn.column as unknown as IBaseTableColLayout;

            return (
              <Table.Cell
                {...cellProps}
                children={
                  (column && column.subtotal) && stringSymbolEquals("data", cellProps.tableColumn.type)
                    ? `${column.subtotal.name}: ${this.getCellSubtotal(cellProps.tableRow.key.substr(SUMMARY_KEY_PREFIX.length), column)}`
                    : undefined
                }
              />
            );
          }}
        </Template>
      </Plugin>
    );
  }

  @autobind
  private getCellSubtotal(rowKey: GroupKey, column: IBaseTableColLayout): string {
    const groupSubtotals = this.props.subtotalData && this.props.subtotalData.get(rowKey);
    const result = groupSubtotals
      && groupSubtotals.data
      && groupSubtotals.data[column.id];

    if (result === null || result === undefined) {
      return NO_DATA_TEXT;
    }

    if (column.tableRenderPlugin.useInSubtotal) {
      return column.tableRenderPlugin.formatSubtotal(result, column.tableRenderParams);
    }

    return result;
  }

}
