// tslint:disable:no-any
import autobind from "autobind-decorator";
import * as React from "react";

import {WaitData} from '../../WaitData';
import {INewSearchProps, SelectData} from "../types";

import {BaseSelectFilter, IBaseSelectFilterProps} from "./BaseSelectFilter";

export class CustomSelectFilter<T extends string | string[] | number | number[]>
  extends React.Component<Omit<IBaseSelectFilterProps<T>, "data" | "onChange"> & INewSearchProps> {

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
  private onChange(value: T): void {
    const filter = (this.props.mode && ["multiple", "tags", "combobox"].includes(this.props.mode))
      ? {
        columnName: this.props.column.name,
        operation: "in",
        raw: true,
        value: (value || [])
      } : {
        columnName: this.props.column.name,
        operation: "equal",
        raw: true,
        value: value as any
      };

    this.props.onFilter(filter);
  }

}
