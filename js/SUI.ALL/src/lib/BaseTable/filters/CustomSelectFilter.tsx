// tslint:disable:no-any
import * as React from "react";

import { WaitData } from '../../WaitData';
import {INewSearchProps, SelectData} from "../types";

import {BaseSelectFilter, IBaseSelectFilterProps} from "./BaseSelectFilter";

export class CustomSelectFilter<T extends string | number>
  extends React.Component<Omit<IBaseSelectFilterProps<T>, "data"> & INewSearchProps> {

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
          <BaseSelectFilter<T>
            {...this.props}
            data={selectData as any}
          />
        )}
      </WaitData>
    );
  }

}
