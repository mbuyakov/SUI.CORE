// tslint:disable:no-any
import {TableFilterRow} from "@devexpress/dx-react-grid";
import {WaitData} from "@smsoft/sui-promised";
import * as React from "react";

import {INewSearchProps, SelectData} from "../types";

import {BaseSelectFilter} from "./BaseSelectFilter";

export class CustomSelectFilter extends React.Component<TableFilterRow.CellProps & INewSearchProps> {

  public static isPromise(element: any): boolean {
    return !!element && (typeof(element) === 'object' || typeof(element) === 'function') && typeof(element.then) === 'function'
  }

  public render(): JSX.Element {
    const data: any = this.props.selectData;

    return (
      <WaitData<SelectData>
        {...(CustomSelectFilter.isPromise(data) ? {promise: data} : {data})}
        alwaysUpdate={true}
      >
        {(selectData) => (
          <BaseSelectFilter
            {...this.props}
            data={selectData}
          />
        )}
      </WaitData>
    );
  }

}
