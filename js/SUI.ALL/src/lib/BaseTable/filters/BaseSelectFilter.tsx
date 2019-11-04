/* tslint:disable:no-any */
import {TableFilterRow} from '@devexpress/dx-react-grid';
import {Select} from 'antd';
import {SelectProps, SelectValue} from "antd/lib/select";
import autobind from 'autobind-decorator';
import isEqual from 'lodash/isEqual';
import * as React from 'react';

import {getDataByKey} from "../../dataKey";
import {Omit} from "../../other";
import {OneOrArray} from "../../typeWrappers";
import {ICommonColumnSearchProps} from "../types";

export interface ISelectColumnFilterData {
  title?: string | JSX.Element;
  value: string | number;
}

export type IBaseSelectFilterProps<T> = TableFilterRow.CellProps
  & ICommonColumnSearchProps
  & Omit<SelectProps<T>, "disabled" | "value" | "onChange">
  & {
    data?: ISelectColumnFilterData[];
    onChange?(value: T, option: OneOrArray<React.ReactElement>): void
  };

interface IBaseSelectFilterState {
  data?: ISelectColumnFilterData[];
}

export class BaseSelectFilter<T = SelectValue> extends React.Component<IBaseSelectFilterProps<T>, IBaseSelectFilterState> {

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
    const filterValue = getDataByKey(this.props.filter, "value");

    return (
      <Select<any>
        showSearch={true}
        optionFilterProp="children"
        allowClear={true}
        disabled={this.props.disabled}
        placeholder={<span style={{fontWeight: 400}}>{this.props.placeholder || 'Фильтр...'}</span>}
        {...restProps}
        value={
          // tslint:disable-next-line:triple-equals
          filterValue != null
            ? (Array.isArray(filterValue) ? filterValue : filterValue.toString())
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
    const dataElementByValue = new Map<string | null, ISelectColumnFilterData>();
    (this.props.data || []).forEach((element: any) => {
      if (!dataElementByValue.has(element.value && element.value.toString())) {
        dataElementByValue.set(element.value && element.value.toString(), element);
      }
    });

    this.setState({data: Array.from(dataElementByValue.values())});
  }

}
