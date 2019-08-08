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
        value={this.props.filter ? this.props.filter.value : undefined}
        onChange={this.onChange}
      />
    );
  }

  @autobind
  // tslint:disable-next-line:no-any
  private onChange(event: any): void {
    this.props.onFilter({
      columnName: this.props.column.name,
      operation: this.props.operation,
      value: event.target.value,
    });
  }

}
