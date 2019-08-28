import {TableFilterRow} from '@devexpress/dx-react-grid';
import Input from 'antd/lib/input/Input';
import autobind from 'autobind-decorator';
import * as React from 'react';

import {INewSearchProps} from "../types";

export class StringColumnFilter extends React.Component<TableFilterRow.CellProps & INewSearchProps> {

  public render(): JSX.Element {
    const {children, ...clearProps} = this.props;

    return (
      <Input
        {...clearProps}
        placeholder={this.props.placeholder as string || 'Фильтр...'}
        defaultValue={this.props.filter ? this.props.filter.value : undefined}
        onPressEnter={this.onChange}
      />
    );
  }

  @autobind
  private onChange(event: React.KeyboardEvent<HTMLInputElement>): void {
    this.props.onFilter({
      columnName: this.props.column.name,
      operation: this.props.operation || "contains",
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      value: event.target.value
    });
  }

}
