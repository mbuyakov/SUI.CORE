/* tslint:disable:no-any */
import {TableFilterRow} from '@devexpress/dx-react-grid';
import {Select} from 'antd';
import {SelectProps} from "antd/lib/select";
import autobind from 'autobind-decorator';
import isEqual from 'lodash/isEqual';
import * as React from 'react';

import {Omit} from "../../other";
import {ICommonColumnSearchProps} from "../types";

export interface ISelectColumnFilterData<T> {
  title?: string | JSX.Element;
  value: T;
}

export type IBaseSelectFilterProps<T> = TableFilterRow.CellProps
  & ICommonColumnSearchProps
  & Omit<SelectProps, "disabled" | "value" | "onChange">
  & {
    data?: Array<ISelectColumnFilterData<T>>;
    onChange?(value: T, option: React.ReactElement | React.ReactElement[]): void
  };

interface IBaseSelectFilterState<T> {
  data?: Array<ISelectColumnFilterData<T>>;
}

export class BaseSelectFilter<T extends string | number> extends React.Component<IBaseSelectFilterProps<T>, IBaseSelectFilterState<T>> {

  public componentDidMount(): void {
    this.updateStateData();
  }

  public componentDidUpdate(nextProps: IBaseSelectFilterProps<T>): void {
    if (!isEqual(this.props.data, nextProps.data)) {
      this.updateStateData();
    }
  }

  public render(): JSX.Element {
    const {defaultValue, ...restProps} = this.props;

    return (
      <Select
        optionFilterProp="children"
        allowClear={true}
        disabled={this.props.disabled}
        placeholder={<span style={{fontWeight: 400}}>{this.props.placeholder || 'Фильтр...'}</span>}
        {...restProps}
        value={
          this.props.filter && this.props.filter.value !== null && this.props.filter.value !== undefined
            ? this.props.filter.value.toString()
            : undefined
        }
        style={{
          width: "100%",
          ...this.props.style
        }}
        onChange={this.onChange as any}
      >
        {(this.state && this.state.data || [])
          .filter(element => element.value)
          .map(element => (
            <Select.Option
              key={element.value.toString()}
              value={element.value}
            >
              {element.title || element.value}
            </Select.Option>
          ))}
      </Select>
    );
  }

  @autobind
  private onChange(value: T, option: React.ReactElement | React.ReactElement[]): void {
    if (this.props.onChange) {
      this.props.onChange(value, option);
    } else {
      this.props.onFilter({
        columnName: this.props.column.name,
        operation: "equal",
        value: value as any
      });
    }
  }

  @autobind
  private updateStateData(): void {
    const dataElementByValue = new Map<string | null, ISelectColumnFilterData<T>>();
    (this.props.data || []).forEach((element: any) => {
      if (!dataElementByValue.has(element.value && element.value.toString())) {
        dataElementByValue.set(element.value && element.value.toString(), element);
      }
    });

    this.setState({data: Array.from(dataElementByValue.values())});
  }

}
