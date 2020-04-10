import {DatePicker} from "antd";
import autobind from "autobind-decorator";
import moment, {Moment} from "moment";
import * as React from 'react';

import {RangePickerValue} from "../../compatibleTypes";
import {GET_DEFAULT_CALENDAR_RANGES} from "../../const";
import {getDataByKey} from "../../dataKey";
import {ICommonColumnSearchProps, LazyTableFilterRowCellProps} from "../types";

type DatetimeType = "date" | "datetime";

interface IBaseDatetimeIntervalColumnFilterProps {
  format?: string;
  pickerMode: DatetimeType;
}

interface IBaseDatetimeIntervalColumnFilterState {
  filterValue?: RangePickerValue;
  lastSavedValue?: RangePickerValue;
  open?: boolean;
}

type FullBaseDatetimeIntervalColumnFilterProps = LazyTableFilterRowCellProps
  & IBaseDatetimeIntervalColumnFilterProps
  & ICommonColumnSearchProps;

export class BaseDatetimeIntervalColumnFilter
  extends React.Component<FullBaseDatetimeIntervalColumnFilterProps, IBaseDatetimeIntervalColumnFilterState> {

  private static formatMoment(
    ts: Moment | null,
    roundDay: "start" | "end" | null,
    callUts: boolean = false
  ): string | null {
    if (ts) {
      let result = ts;

      if (roundDay === "start") {
        result = result.startOf('day');
      } else if (roundDay === "end") {
        result = result.endOf('day');
      }

      if (callUts) {
        result = result.utc()
      }

      return result.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    }

    return null
  }

  public constructor(props: FullBaseDatetimeIntervalColumnFilterProps) {
    super(props);
    const propsFilterValue = this.props.filter && (this.props.filter.value as unknown as string[]);
    const filterValue = propsFilterValue && propsFilterValue.map(value => value && moment.utc(value).local()) as RangePickerValue;

    this.state = {
      filterValue,
      lastSavedValue: filterValue
    };
  }

  public render(): JSX.Element {
    return (
      <DatePicker.RangePicker
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
  // Костыль
  private getColumnType(): DatetimeType {
    return getDataByKey(this.props.column, "__SUI_columnInfo", "columnType") === "date" ? "date" : "datetime"
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
  private triggerFilter(value: RangePickerValue): void {
    this.setState({lastSavedValue: value});

    const isDatePickMode = this.props.pickerMode === "date";
    const callUtc = this.getColumnType() === "datetime";

    this.props.onFilter({
      columnName: this.props.column.name,
      operation: "interval",
      value: [
        BaseDatetimeIntervalColumnFilter.formatMoment(value && value[0] && value[0].clone(), isDatePickMode ? 'start' : null, callUtc),
        BaseDatetimeIntervalColumnFilter.formatMoment(value && value[1] && value[1].clone(), isDatePickMode ? 'end' : null, callUtc)
        // tslint:disable-next-line:no-any
      ] as any
    });
  }

}
