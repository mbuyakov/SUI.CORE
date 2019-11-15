/* tslint:disable:no-any */
import {TableFilterRow} from "@devexpress/dx-react-grid";
import InputNumber from 'antd/lib/input-number';
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
    const filterValue = (props.filter && (props.filter.value as unknown as number[]) || []);

    this.state = {
      fromValue: filterValue[0],
      toValue: filterValue[1]
    };
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
          placeholder="С"
          style={{width: "100%"}}
          value={this.state.fromValue}
          onChange={this.handleChangeFn("fromValue")}
          onKeyUp={this.enterTriggerFilter}
        />
        <span>~</span>
        <InputNumber
          placeholder="По"
          style={{width: "100%"}}
          value={this.state.toValue}
          onChange={this.handleChangeFn("toValue")}
          onKeyUp={this.enterTriggerFilter}
        />
      </div>
    );
  }

  @autobind
  private enterTriggerFilter(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      const {
        fromValue,
        toValue
      } = this.state;

      this.props.onFilter({
        columnName: this.props.column.name,
        operation: "interval",
        value: [
          (fromValue != null) ? fromValue : null,
          (toValue != null) ? toValue : null
        ] as any
      });
    }
  }

  @autobind
  private handleChangeFn(property: keyof INumberIntervalColumnFilterState): (value: number | string | null) => void {
    return (value): void => {
      let numberValue = null;
      console.log(property, value);

      // tslint:disable-next-line:switch-default
      switch (typeof(value)) {
        case "number":
          numberValue = value;
          break;
        case "string":
          let stringValue = value;

          while (stringValue.length && Number.isNaN(Number(stringValue))) {
            stringValue = stringValue.substr(0, stringValue.length - 1);
          }

          if (stringValue.length) {
            numberValue = Number(stringValue);
          }
      }

      this.setState({[property]: typeof(value) === "number" ? value : null})
    };
  }

}
