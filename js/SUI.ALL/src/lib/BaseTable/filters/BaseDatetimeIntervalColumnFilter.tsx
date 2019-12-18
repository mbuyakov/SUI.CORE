import {Filter, TableFilterRow} from "@devexpress/dx-react-grid";
import {DatePicker} from "antd";
import {RangePickerValue} from "antd/lib/date-picker/interface";
import autobind from "autobind-decorator";
import moment from "moment";
import * as React from 'react';

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
  lastSavedValue?: RangePickerValue | null;
  open?: boolean;
}

type FullBaseDatetimeIntervalColumnFilterProps = TableFilterRow.CellProps
  & IBaseDatetimeIntervalColumnFilterProps
  & ICommonColumnSearchProps;

export class BaseDatetimeIntervalColumnFilter
  extends React.Component<FullBaseDatetimeIntervalColumnFilterProps, IBaseDatetimeIntervalColumnFilterState> {

  public constructor(props: FullBaseDatetimeIntervalColumnFilterProps) {
    super(props);
    const propsFilterValue = this.props.filter && (this.props.filter.value as unknown as string[]);
    const filterValue = propsFilterValue && propsFilterValue.map(value => value && moment(value).local()) as RangePickerValue;

    this.state = {
      filterValue,
      lastSavedValue: filterValue
    };
  }

  public render(): JSX.Element {
    return (
      <DatePicker.RangePicker
        showToday={true}
        {...this.props}
        allowClear={true}
        placeholder={this.props.placeholder as [string, string] || ["Начало", "Конец"]}
        style={{width: "100%"}}
        showTime={this.props.pickerMode === "datetime"}
        ranges={GET_DEFAULT_CALENDAR_RANGES()}
        defaultValue={this.state.filterValue}
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
    this.setState({open: status}, () => {
      // if closed
      if (!status) {
        const {filterValue, lastSavedValue} = this.state;
        const isChanged = JSON.stringify(lastSavedValue) !== JSON.stringify(filterValue);

        if (isChanged) {
          this.triggerFilter(this.state.filterValue);
        }
      }
    });
  }

  @autobind
  private triggerFilter(value: RangePickerValue | null | undefined): void {
    const format = moment.HTML5_FMT.DATETIME_LOCAL_MS;

    this.setState({lastSavedValue: value});

    this.props.onFilter({
      columnName: this.props.column.name,
      operation: "interval",
      value: [
        value && value[0] && value[0].clone().startOf('day').utc().format(format),
        value && value[1] && value[1].clone().endOf('day').utc().format(format)
        // tslint:disable-next-line:no-any
      ] as any
    });
  }

}
