import {Filter, TableFilterRow} from "@devexpress/dx-react-grid";
import {DatePicker} from "antd";
import {RangePickerValue} from "antd/lib/date-picker/interface";
import autobind from "autobind-decorator";
import moment from "moment";
import React from 'react';

import { GET_DEFAULT_CALENDAR_RANGES } from '../../const';
import {ICommonColumnSearchProps} from "../types";

type DatetimeFilterType = "date" | "datetime";

interface IBaseDatetimeIntervalColumnFilterProps {
  format?: string;
  pickerMode: DatetimeFilterType;

  onFilter(filter: Filter | Filter[] | null): void;
}

interface IBaseDatetimeIntervalColumnFilterState {
  filterValue?: RangePickerValue | null;
  open?: boolean;
}

type FullBaseDatetimeIntervalColumnFilterProps = TableFilterRow.CellProps
  & IBaseDatetimeIntervalColumnFilterProps
  & ICommonColumnSearchProps;

export class BaseDatetimeIntervalColumnFilter
  extends React.Component<FullBaseDatetimeIntervalColumnFilterProps, IBaseDatetimeIntervalColumnFilterState> {

  private static getFormat(type: DatetimeFilterType): string {
    switch (type) {
      case "date":
        return "YYYY-MM-DD";
      default:
        return "YYYY-MM-DDTHH:mm:ss";
    }
  }

  public constructor(props: FullBaseDatetimeIntervalColumnFilterProps) {
    super(props);
    const filterValue = this.props.filter && (this.props.filter.value as unknown as string[]);
    this.state = {
      filterValue: filterValue && filterValue.map(value => value && moment(value)) as RangePickerValue
    };
  }

  public render(): JSX.Element {
    return (
      <DatePicker.RangePicker
        {...this.props}
        placeholder={this.props.placeholder as [string, string] || ["Начало", "Конец"]}
        style={{width: "100%"}}
        showTime={BaseDatetimeIntervalColumnFilter.getFormat(this.props.pickerMode).includes("HH")}
        ranges={GET_DEFAULT_CALENDAR_RANGES()}
        allowClear={true}
        value={this.state.filterValue}
        onChange={this.onChange}
        onOpenChange={this.onOpenChange}
        open={this.state.open}
      />
    );
  }

  @autobind
  private onChange(filterValue: RangePickerValue): void {
    if (!filterValue || !filterValue.length) {
      // clear filter
      this.triggerFilter(filterValue);
    } else {
      this.setState({filterValue});
    }
  }
  @autobind
  private onOpenChange(status: boolean): void {
    this.setState({open: status}, () => !status && this.triggerFilter(this.state.filterValue));
  }

  @autobind
  private triggerFilter(value: RangePickerValue | null | undefined): void {
    const format = BaseDatetimeIntervalColumnFilter.getFormat(this.props.pickerMode);

    this.props.onFilter({
      columnName: this.props.column.name,
      operation: "interval",
      value: [
        value && value[0] && value[0].format(format),
        value && value[1] && value[1].format(format)
        // tslint:disable-next-line:no-any
      ] as any
    });
  }

}
