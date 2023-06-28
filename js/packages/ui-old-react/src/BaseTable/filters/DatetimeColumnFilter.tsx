import * as React from "react";

import {INewSearchProps, LazyTableFilterRowCellProps} from "../types";

// noinspection ES6PreferShortImport
import {BaseDatetimeIntervalColumnFilter} from "./BaseDatetimeIntervalColumnFilter";

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
