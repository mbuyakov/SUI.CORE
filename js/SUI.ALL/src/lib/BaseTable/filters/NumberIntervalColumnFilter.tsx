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
          alignItems: "center",
          display: "grid",
          gap: 4,
          gridTemplateColumns: "1fr max-content 1fr"
        }}
      >
        <InputNumber
          max={this.state.toValue}
          placeholder="С"
          style={{width: "100%"}}
          value={this.state.fromValue}
          onChange={this.handleChangeFn("fromValue")}
          onPressEnter={this.triggerFilter}
        />
        <span>~</span>
        <InputNumber
          min={this.state.fromValue}
          placeholder="По"
          style={{width: "100%"}}
          value={this.state.toValue}
          onChange={this.handleChangeFn("toValue")}
          onPressEnter={this.triggerFilter}
        />
      </div>
    );
  }

  @autobind
  private handleChangeFn(property: keyof INumberIntervalColumnFilterState): (value: number) => void {
    return value => this.setState({[property]: value});
  }

  @autobind
  private triggerFilter(): void {
    console.log("NumberIntervalColumnFilter triggerFilter call");

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
