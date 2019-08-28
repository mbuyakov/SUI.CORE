/* tslint:disable:no-any */
import {TableFilterRow} from '@devexpress/dx-react-grid';
import {Select} from 'antd';
import autobind from 'autobind-decorator';
import isEqual from 'lodash/isEqual';
import * as React from 'react';

import {ICommonColumnSearchProps} from "../types";

export interface ISelectColumnFilterData {
  title?: string | JSX.Element;
  value: string | number;
}

interface ISelectColumnFilterProps {
  data?: ISelectColumnFilterData[];
  disableSearch?: boolean;
  style?: React.CSSProperties;

  onChange?(value: any): void;

  optionFilter?(option: any): boolean;
}

export class BaseSelectFilter extends React.Component<TableFilterRow.CellProps & ISelectColumnFilterProps & ICommonColumnSearchProps,
  { data?: ISelectColumnFilterData[] }> {

  public componentDidMount(): void {
    this.updateStateData();
  }

  public componentDidUpdate(nextProps: ISelectColumnFilterProps): void {
    if (!isEqual(this.props.data, nextProps.data)) {
      this.updateStateData();
    }
  }

  public render(): JSX.Element {
    return (
      <Select
        showSearch={!this.props.disableSearch}
        optionFilterProp="children"
        allowClear={true}
        disabled={this.props.disabled}
        placeholder={<span style={{fontWeight: 400}}>{this.props.placeholder || 'Фильтр...'}</span>}
        value={
          this.props.filter && this.props.filter.value !== null && this.props.filter.value !== undefined
            ? this.props.filter.value.toString()
            : undefined
        }
        style={{
          width: "100%",
          ...this.props.style
        }}
        onChange={this.onChange}
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
          ))
          .filter(option => this.props.optionFilter ? this.props.optionFilter(option) : true)}
      </Select>
    );
  }

  @autobind
  private onChange(value: string | number): void {
    if (this.props.onChange) {
      this.props.onChange(value);
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
