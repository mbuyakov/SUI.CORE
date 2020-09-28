import InputNumber from 'antd/lib/input-number';
import autobind from "autobind-decorator";
import * as React from 'react';

import {INewSearchProps, LazyTableFilterRowCellProps} from "../types";

type INumberIntervalColumnFilterProps = LazyTableFilterRowCellProps & INewSearchProps;

type SingleValue = number | null;
type FilterValue = [SingleValue, SingleValue];

interface INumberIntervalColumnFilterState {
  lastFilterValue: FilterValue;
  value: FilterValue;
}

const propsFilterValueToStateFilterValue = (filterValue: FilterValue): FilterValue => [filterValue[0] ?? null, filterValue[1] ?? null];
const equals = (filterValue1: FilterValue, filterValue2: FilterValue): boolean => (filterValue1[0] === filterValue2[0]) && ((filterValue1[1] === filterValue2[1]));

export class NumberIntervalColumnFilter extends React.Component<INumberIntervalColumnFilterProps, INumberIntervalColumnFilterState> {

  public constructor(props: INumberIntervalColumnFilterProps) {
    super(props);

    const value = propsFilterValueToStateFilterValue((props.filter?.value || []) as unknown as FilterValue);

    this.state = { lastFilterValue: value, value };
  }

  public componentDidUpdate(): void {
    const value = propsFilterValueToStateFilterValue((this.props.filter?.value || []) as unknown as FilterValue);

    if (!equals(value, this.state.lastFilterValue)) {
      this.setState({ lastFilterValue: value, value });
    }
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
          value={this.state.value[0]}
          onBlur={this.onBlur}
          onChange={this.onChangeFn(0)}
          onKeyUp={this.onKeyUp}
        />
        <span>~</span>
        <InputNumber
          placeholder="По"
          style={{width: "100%"}}
          value={this.state.value[1]}
          onBlur={this.onBlur}
          onChange={this.onChangeFn(1)}
          onKeyUp={this.onKeyUp}
        />
      </div>
    );
  }

  @autobind
  private onBlur(): void {
    this.triggerFilter(true);
  }

  @autobind
  private onChangeFn(index: number): (value: number | string | null) => void {
    return (value): void => {
      let numberValue = null;

      // tslint:disable-next-line:switch-default
      switch (typeof (value)) {
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

      const stateValue = [...this.state.value] as FilterValue;

      stateValue[index] = numberValue ?? null;

      this.setState({ value: stateValue });
    };
  }

  @autobind
  private onKeyUp(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      this.triggerFilter(false);
    }
  }

  @autobind
  private triggerFilter(lazy: boolean): void {
    const value = this.state.value;

    if (!lazy || !equals(value, this.state.lastFilterValue)) {
      this.props.onFilter({
        columnName: this.props.column.name,
        lazy,
        operation: "interval",
        value: value as any
      });
    }
  }

}
