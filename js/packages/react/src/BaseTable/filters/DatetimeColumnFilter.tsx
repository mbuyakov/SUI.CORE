import * as React from "react";


import {BaseDatetimeIntervalColumnFilter} from "./BaseDatetimeIntervalColumnFilter";
import {INewSearchProps, LazyTableFilterRowCellProps} from '../types';

export class DatetimeColumnFilter extends React.Component<LazyTableFilterRowCellProps & INewSearchProps> {

  public render(): JSX.Element {
    return (
      <BaseDatetimeIntervalColumnFilter
        {...this.props}
        pickerMode="datetime"
      />
    );
  }

}
