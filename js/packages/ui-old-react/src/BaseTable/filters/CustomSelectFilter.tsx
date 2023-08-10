/* eslint-disable @typescript-eslint/no-explicit-any */
import autobind from "autobind-decorator";
import * as React from "react";

// noinspection ES6PreferShortImport
import {SimpleBackendFilter} from "../../BackendTable";
// noinspection ES6PreferShortImport
import {WaitData} from "../../WaitData";
import {INewSearchProps, LazyFilter, SelectData} from "../types";

import {BaseSelectFilter, IBaseSelectFilterProps} from "./BaseSelectFilter";

type ICustomSelectFilterProps<T> = Omit<IBaseSelectFilterProps<T>, "data" | "onChange"> & INewSearchProps & { filters?: LazyFilter[] };

interface ICustomSelectFilterState<T> {
  lastFilterValue?: T;
  value?: T;
}

function extractValueFromFilter<T>(filter: LazyFilter): T | undefined {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return (filter?.elements ?? filter?.value) as T | undefined;
}

export class CustomSelectFilter<T extends string | string[] | number | number[]> extends React.Component<ICustomSelectFilterProps<T>, ICustomSelectFilterState<T>> {

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static isPromise(element: any): boolean {
    return !!element && (typeof (element) === "object" || typeof (element) === "function") && typeof (element.then) === "function";
  }

  public constructor(props: ICustomSelectFilterProps<T>) {
    super(props);

    const value: T = extractValueFromFilter(props.filter);

    this.state = {lastFilterValue: value, value};
  }

  public componentDidUpdate(): void {
    const value: T = extractValueFromFilter(this.props.filter);

    if (JSON.stringify(value) !== JSON.stringify(this.state.lastFilterValue)) {
      this.setState({
        lastFilterValue: value,
        value
      });
    }
  }

  public render(): React.JSX.Element {
    const data: any = this.props.selectData;
    const value: any = this.state.value ?? (this.isMultiple() ? [] : undefined);

    return (
      <WaitData<SelectData>
        {...(CustomSelectFilter.isPromise(data) ? {promise: data} : {data})}
        alwaysUpdate={true}
      >
        {(selectData): React.JSX.Element => (
          <BaseSelectFilter<T>
            // Multiple render issue
            maxTagCount={5}
            {...this.props}
            filter={{...this.props.filter, value}}
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
  private onChange(value: T): void {
    console.log("CustomSelectFilter", value);
    this.triggerFilter(value);
    this.setState({value});
  }

  @autobind
  private triggerFilter(value: T, lazy: boolean = false): void {
    let filter: SimpleBackendFilter;

    const columnName = this.props.column.name;

    if (this.isMultiple()) {
      if (value && Array.isArray(value) && value.length) {
        filter = {
          columnName,
          lazy,
          operation: "in",
          elements: value as any,
          raw: false
        };
      } else {
        filter = {
          columnName,
          lazy,
          operation: "equal",
          value: undefined,
          raw: false
        };
      }
    } else {
      filter = {
        columnName,
        lazy,
        operation: "equal",
        value: value as any,
        raw: false
      };
    }

    this.props.onFilter(filter);
    this.setState({lastFilterValue: extractValueFromFilter<T>(filter)});
  }

}
