/* eslint-disable @typescript-eslint/no-explicit-any */
import {SimpleBackendFilter} from "@/BackendTable";
import {WaitData} from '@/WaitData';
import {asyncMap, camelCase, ColumnInfoDependence, ColumnInfoManager, IObjectWithIndex} from '@sui/core';
import autobind from "autobind-decorator";
import * as React from "react";
import {INewSearchProps, LazyFilter, SelectData} from '../types';

import {BaseSelectFilter, IBaseSelectFilterProps} from "./BaseSelectFilter";

type ICustomSelectFilterProps<T> = Omit<IBaseSelectFilterProps<T>, "data" | "onChange"> & INewSearchProps & { filters?: LazyFilter[] };

interface ICustomSelectFilterState<T> {
  dependencies: Array<{ catalogColumnName: string; dependsOnColumnName: string; }>;
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
    return !!element && (typeof (element) === 'object' || typeof (element) === 'function') && typeof (element.then) === 'function'
  }

  public constructor(props: ICustomSelectFilterProps<T>) {
    super(props);

    const value: T = extractValueFromFilter(props.filter);

    this.state = {
      dependencies: [],
      lastFilterValue: value,
      value
    }
  }

  public async componentDidMount(): Promise<void> {
    const dependencies: ColumnInfoDependence[] | undefined = (this.props.column as IObjectWithIndex).__SUI_columnInfo?.dependencies;

    if (dependencies?.length) {
      this.setState({
        dependencies: await asyncMap(
          dependencies,
          async it => ({
            catalogColumnName: (await ColumnInfoManager.getById(it.catalogColumnInfoId)).columnName,
            dependsOnColumnName: (await ColumnInfoManager.getById(it.dependsOnColumnInfoId)).columnName,
          })
        )
      });
    }
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

  public render(): JSX.Element {
    const data: any = this.props.selectData;
    const value: any = this.state.value ?? (this.isMultiple() ? [] : undefined);

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
            filter={{ ...this.props.filter, value }}
            data={this.filterData(selectData)}
            onChange={this.onChange}
          />
        )}
      </WaitData>
    );
  }

  @autobind
  private filterData(data: SelectData): SelectData {
    let resultData = data;

    if (this.state.dependencies?.length) {
      this.state.dependencies.forEach(dependence => {
        const dependsOnValues: string[] = [];

        this.props.filters.forEach(filter => {
          if (filter.columnName === dependence.dependsOnColumnName) {
            const typedFilter = filter as SimpleBackendFilter;

            if (typedFilter.elements) {
              typedFilter.elements.forEach(element => dependsOnValues.push(String(element)));
            } else if (typedFilter.value != null) {
              dependsOnValues.push(String(typedFilter.value))
            }
          }
        });

        if (dependsOnValues.length) {
          const catalogColumnName = camelCase(dependence.catalogColumnName);
          resultData = resultData.filter(it => dependsOnValues.includes(String(it.src[catalogColumnName])));
        }
      });
    }

    return resultData;
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
    const raw = true;

    if (this.isMultiple()) {
      if (value && Array.isArray(value) && value.length) {
        filter = {
          columnName,
          lazy,
          raw,
          operation: "in",
          elements: value as any
        };
      } else {
        filter = {
          columnName,
          lazy,
          raw,
          operation: "equal",
          value: undefined
        };
      }
    } else {
      filter = {
        columnName,
        lazy,
        raw,
        operation: "equal",
        value: value as any
      };
    }

    this.props.onFilter(filter);
    this.setState({ lastFilterValue: extractValueFromFilter<T>(filter) });
  }

}
