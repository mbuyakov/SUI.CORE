import autobind from "autobind-decorator";
import * as React from "react";

import {SimpleBackendFilter} from "../../BackendTable";
import {OneOrArray} from "../../typeWrappers";
import {WaitData} from '../../WaitData';
import {INewSearchProps, SelectData} from "../types";

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

  private ignoreNextOnChange: boolean;

  public constructor(props: ICustomSelectFilterProps<T>) {
    super(props);
    // @ts-ignore
    this.state = {value: props.filter ? (props.filter.value || props.filter.elements as T) : undefined}
  }

  public render(): JSX.Element {
    const data: any = this.props.selectData;

    return (
      <WaitData<SelectData>
        {...(CustomSelectFilter.isPromise(data) ? {promise: data} : {data})}
        alwaysUpdate={true}
      >
        {(selectData): JSX.Element => (
          <BaseSelectFilter<T>
            // Multiple render issue
            maxTagCount={5}
            {...this.props}
            filter={{ ...this.props.filter, value: this.state.value as any }}
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
    if (!this.ignoreNextOnChange) {
      const lazy = !!(option && Array.isArray(option) && option.length); // Don't trigger for option click in multiple mode

      this.triggerFilter(value, lazy);
      this.setState({value});
    } else {
      this.ignoreNextOnChange = false
    }
  }

  @autobind
  private onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (this.isMultiple() && event.key === 'Enter') {
      this.ignoreNextOnChange = true;
      this.triggerFilter(this.state.value);
    }
  }

  @autobind
  private triggerFilter(value: T, lazy: boolean = false): void {
    let filter: SimpleBackendFilter;

    if (this.isMultiple()) {
      if (value && Array.isArray(value) && value.length) {
        filter = {
          columnName: this.props.column.name,
          elements: value as any,
          lazy,
          operation: "in",
          raw: true
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
