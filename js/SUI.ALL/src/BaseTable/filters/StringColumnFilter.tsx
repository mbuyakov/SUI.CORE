import Input from 'antd/lib/input/Input';
import autobind from 'autobind-decorator';
import * as React from 'react';

import {INewSearchProps, LazyTableFilterRowCellProps} from "../types";

export class StringColumnFilter extends React.Component<LazyTableFilterRowCellProps & INewSearchProps> {

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
    const lazy = !(event.type === "click" && value === ""); // Trigger on clearButton click

    this.triggerFilter(value, lazy)
  }

  @autobind
  private onPressEnter(event: React.KeyboardEvent<HTMLInputElement>): void {
// @ts-ignore
    this.triggerFilter(event.target.value)
  }

  @autobind
  private triggerFilter(value: string, lazy: boolean = false): void {
    this.props.onFilter({
      columnName: this.props.column.name,
      lazy,
      operation: this.props.operation || "contains",
      value
    });
  }

}
