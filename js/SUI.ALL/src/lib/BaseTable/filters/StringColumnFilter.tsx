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
        allowClear={true}
        placeholder={this.props.placeholder as string || 'Фильтр...'}
        defaultValue={this.props.filter ? this.props.filter.value : undefined}
        onChange={this.onChange}
        onPressEnter={this.onPressEnter}
      />
    );
  }

  @autobind
  private onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value;

    // Trigger on clearButton click
    if (event.type === "click" && value === "") {
      this.triggerFilter(value)
    }
  }

  @autobind
  private onPressEnter(event: React.KeyboardEvent<HTMLInputElement>): void {
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    this.triggerFilter(event.target.value)
  }

  @autobind
  private triggerFilter(value: string): void {
    this.props.onFilter({
      columnName: this.props.column.name,
      operation: this.props.operation || "contains",
      value
    });
  }

}
