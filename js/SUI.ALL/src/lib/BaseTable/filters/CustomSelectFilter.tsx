// tslint:disable:no-any
import autobind from "autobind-decorator";
import * as React from "react";

import {WaitData} from '../../WaitData';
import {INewSearchProps, LazyFilter, SelectData} from "../types";

import {BaseSelectFilter, IBaseSelectFilterProps} from "./BaseSelectFilter";

type ICustomSelectFilterProps<T> = Omit<IBaseSelectFilterProps<T>, "data" | "onChange"> & INewSearchProps;

export class CustomSelectFilter<T extends string | string[] | number | number[]> extends React.Component<ICustomSelectFilterProps<T>> {

  public static isPromise(element: any): boolean {
    return !!element && (typeof (element) === 'object' || typeof (element) === 'function') && typeof (element.then) === 'function'
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
            data={selectData}
            onChange={this.onChange}
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
  private onChange(value: T, option: any): void {
    let filter: LazyFilter & {raw?: boolean} = null;

    console.log("CustomSelectFilter.onChange", value, option);

    if (this.isMultiple()) {
      if (value && Array.isArray(value) && value.length) {
        filter = {
          columnName: this.props.column.name,
          lazy: true,
          operation: "in",
          raw: true,
          value: (value || []) as any
        };
      }
    } else {
      filter = {
        columnName: this.props.column.name,
        operation: "equal",
        raw: true,
        value: value as any
      };
    }

    this.props.onFilter(filter);
  }

  // @autobind
  // private onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
  //
  // }

}
