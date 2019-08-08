import {Filter, TableFilterRow} from "@devexpress/dx-react-grid";
import {GET_DEFAULT_CALENDAR_RANGES} from "@smsoft/sui-core";
import {DatePicker} from "antd";
import {RangePickerValue} from "antd/lib/date-picker/interface";
import autobind from "autobind-decorator";
import moment from "moment";
import React from 'react';

import {ICommonColumnSearchProps} from "../types";

type DatetimeFilterType = "date" | "datetime";

interface IBaseDatetimeIntervalColumnFilterProps {
  format?: string;
  pickerMode: DatetimeFilterType;
  onFilter(filter: Filter | Filter[] | null): void;
}

export class BaseDatetimeIntervalColumnFilter extends React.Component<
  TableFilterRow.CellProps & IBaseDatetimeIntervalColumnFilterProps & ICommonColumnSearchProps
> {

  private static getFormat(type: DatetimeFilterType): string {
    switch (type) {
      case "date":
        return "YYYY-MM-DD";
      default:
        return "YYYY-MM-DDTHH:mm:ss";
    }
  }

  public render(): JSX.Element {
    const filterValue = this.props.filter && this.props.filter.value;

    return (
      <DatePicker.RangePicker
        {...this.props}
        placeholder={this.props.placeholder as [string, string] || ["Начало", "Конец"]}
        style={{width: "100%"}}
        showTime={BaseDatetimeIntervalColumnFilter.getFormat(this.props.pickerMode).includes("HH")}
        ranges={GET_DEFAULT_CALENDAR_RANGES()}
        allowClear={true}
        value={filterValue ? [
          moment(filterValue[0]),
          moment(filterValue[1]),
        ] : undefined}
        onChange={this.onChange}
      />
    );
  }

  @autobind
  private onChange(value: RangePickerValue): void {
    const format = BaseDatetimeIntervalColumnFilter.getFormat(this.props.pickerMode);
    console.log(value);

    this.props.onFilter({
      columnName: this.props.column.name,
      operation: "interval",
      value: [
        // tslint:disable-next-line:ban-ts-ignore
        // @ts-ignore
        value && value[0] && value[0].format(format),
        // tslint:disable-next-line:ban-ts-ignore
        // @ts-ignore
        value && value[1] && value[1].format(format)
        // tslint:disable-next-line:no-any
      ] as any
    });
  }

}
