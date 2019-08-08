import {TableFilterRow} from "@devexpress/dx-react-grid";
import * as React from "react";

import {INewSearchProps} from "../types";

import { BaseDatetimeIntervalColumnFilter } from './BaseDatetimeIntervalColumnFilter';

export class DateColumnFilter extends React.Component<TableFilterRow.CellProps & INewSearchProps> {

  public render(): JSX.Element {
    return (
      <BaseDatetimeIntervalColumnFilter
        {...this.props}
        pickerMode="date"
      />
    );
  }

}
