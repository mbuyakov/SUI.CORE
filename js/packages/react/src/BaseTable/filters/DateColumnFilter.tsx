import {BaseDatetimeIntervalColumnFilter} from "@/BaseTable";
import * as React from "react";
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
