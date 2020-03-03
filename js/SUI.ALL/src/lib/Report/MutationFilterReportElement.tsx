// tslint:disable:no-any
import autobind from "autobind-decorator";
import React from "react";

import {mutate} from "../gql";
import {IObjectWithIndex} from "../other";

import {FilterReportElement, IFilterReportElementProps} from "./FilterReportElement";

export async function jsonMutationDataFetcher<TRaw = any, TData = any>(
  mutationName: string,
  params: IObjectWithIndex,
  formatter?: (data: TRaw) => TData
): Promise<TData> {
  const formattedParams = Object
    .keys(params)
    // tslint:disable-next-line:triple-equals
    .filter(key => params[key] != null)
    .reduce((result, key) => {
      result[key] = params[key];

      return result;
    }, {} as IObjectWithIndex);

  const data = JSON.parse(
    await mutate(`mutation {
      ${mutationName}(
        input: ${JSON.stringify(formattedParams).replace(/"([^"]+)":/g, "$1:")}
      ) {
        json
      }
    }`, 2)
  );

  return formatter ? formatter(data) : data;
}

export type IMutationFilterReportElementProps<TData, TFilter, TRaw = any> = Omit<
  IFilterReportElementProps<TData, TFilter> & {
    mutationName: string;
    filterFormatter?(filter: TFilter): IObjectWithIndex;
    formatter?(data: TRaw): TData;
  },
  "fetchData"
>;

export class MutationFilterReportElement<TData, TFilter = {}, TRaw = any>
  extends React.Component<IMutationFilterReportElementProps<TData, TFilter, TRaw>> {

  public render(): JSX.Element {
    return (
      <FilterReportElement<TData, TFilter>
        {...this.props}
        fetchData={this.fetchData}
      />
    );
  }

  @autobind
  private fetchData(filter: TFilter): Promise<TData> {
    return jsonMutationDataFetcher<TRaw, TData>(
      this.props.mutationName,
      this.props.filterFormatter ? this.props.filterFormatter(filter) : filter,
      this.props.formatter
    );
  }

}
