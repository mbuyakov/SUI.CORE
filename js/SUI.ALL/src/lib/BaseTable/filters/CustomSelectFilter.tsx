// tslint:disable:no-any
import autobind from "autobind-decorator";
import * as React from "react";

import {OneOrArray} from "../../typeWrappers";
import {WaitData} from '../../WaitData';
import {INewSearchProps, LazyFilter, SelectData} from "../types";

import {BaseSelectFilter, IBaseSelectFilterProps} from "./BaseSelectFilter";

type ICustomSelectFilterProps<T> = Omit<IBaseSelectFilterProps<T>, "data" | "onChange"> & INewSearchProps;

interface ICustomSelectFilterState<T> {
  value?: T;
}

export class CustomSelectFilter<T extends string | string[] | number | number[]>
  extends React.Component<ICustomSelectFilterProps<T>, ICustomSelectFilterState<T>> {

  public static isPromise(element: any): boolean {
    return !!element && (typeof (element) === 'object' || typeof (element) === 'function') && typeof (element.then) === 'function'
  }

  public constructor(props: ICustomSelectFilterProps<T>) {
    super(props);
    this.state = {value: props.filter ? (props.filter.value as T) : undefined}
  }

  public render(): JSX.Element {
    const data: any = this.props.selectData;

    return (
      <WaitData<SelectData>
        {...(CustomSelectFilter.isPromise(data) ? {promise: data} : {data})}
        alwaysUpdate={true}
      >
        {(selectData) => (
          <BaseSelectFilter<T>
            {...this.props}
            filter={this.props.filter
              ? { ...this.props.filter, value: this.state.value as any }
              : undefined
            }
            data={selectData}
            onChange={this.onChange}
            onInputKeyDown={this.onInputKeyDown}
          />
        )}
      </WaitData>
    );
  }

  @autobind
  private isMultiple(): boolean {
    return this.props.mode && ["multiple", "tags", "combobox"].includes(this.props.mode);
  }

  @autobind
  private onChange(value: T, option: OneOrArray<React.ReactElement>): void {
    const lazy = !!(option && Array.isArray(option) && option.length); // Don't trigger for option click in multiple mode

    this.setState({value}, () => this.triggerFilter(lazy));
  }

  @autobind
  private onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (this.isMultiple() && event.key === 'Enter') {
      this.triggerFilter();
    }
  }

  @autobind
  private triggerFilter(lazy: boolean = false): void {
    const value = this.state.value;
    let filter: LazyFilter & {raw?: boolean};

    if (this.isMultiple()) {
      if (value && Array.isArray(value) && value.length) {
        filter = {
          columnName: this.props.column.name,
          lazy,
          operation: "in",
          raw: true,
          value: value  as any
        };
      } else {
        filter = null;
      }
    } else {
      filter = {
        columnName: this.props.column.name,
        lazy,
        operation: "equal",
        raw: true,
        value: value as any
      };
    }

    this.props.onFilter(filter);
  }

}
