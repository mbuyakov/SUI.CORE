import {TableFilterRow} from "@devexpress/dx-react-grid";
import * as React from "react";

import {INewSearchProps} from "../types";

import { BaseSelectFilter, ISelectColumnFilterData } from './BaseSelectFilter';


export class CustomSelectFilter extends React.Component<TableFilterRow.CellProps & INewSearchProps> {

  public render(): JSX.Element {
    return (
      <BaseSelectFilter
        {...this.props}
        data={this.props.customSelectData as ISelectColumnFilterData[]}
      />
    );
  }

}
