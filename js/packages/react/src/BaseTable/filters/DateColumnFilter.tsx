import * as React from "react";


import {BaseDatetimeIntervalColumnFilter} from "./BaseDatetimeIntervalColumnFilter";
import {INewSearchProps, LazyTableFilterRowCellProps} from '../types';

export class DateColumnFilter extends React.Component<LazyTableFilterRowCellProps & INewSearchProps> {

  public render(): JSX.Element {
    return (
      <BaseDatetimeIntervalColumnFilter
        {...this.props}
        pickerMode="date"
      />
    );
  }

}
