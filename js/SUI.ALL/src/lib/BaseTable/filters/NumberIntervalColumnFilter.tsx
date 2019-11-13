/* tslint:disable:no-any */
import {TableFilterRow} from "@devexpress/dx-react-grid";
import {InputNumber} from "antd";
import autobind from "autobind-decorator";
import * as React from 'react';

import {INewSearchProps} from "../types";

type INumberIntervalColumnFilterProps = TableFilterRow.CellProps & INewSearchProps;

interface INumberIntervalColumnFilterState {
  fromValue?: number;
  toValue?: number;
}

export class NumberIntervalColumnFilter
  extends React.Component<INumberIntervalColumnFilterProps, INumberIntervalColumnFilterState> {

  public constructor(props: INumberIntervalColumnFilterProps) {
    super(props);
    this.state = {};
  }

  public render(): JSX.Element {
    return (
      <div
        style={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: "max-content 1fr max-content 1fr"
        }}
      >
        <span>С</span>
        <InputNumber
          value={this.state.fromValue}
          onChange={this.handleChangeFn("fromValue")}
        />
        <span>По</span>
        <InputNumber
          value={this.state.toValue}
          onChange={this.handleChangeFn("toValue")}
        />
      </div>
    );
  }

  @autobind
  private handleChangeFn(property: keyof INumberIntervalColumnFilterState): (value: number) => void {
    return value => this.setState({[property]: value}, this.triggerFilter);
  }

  @autobind
  private triggerFilter(): void {
    this.props.onFilter({
      columnName: this.props.column.name,
      operation: "interval",
      value: [
        this.state.fromValue || null,
        this.state.toValue || null
      ] as any
    });
  }

}
