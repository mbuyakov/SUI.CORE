/* eslint-disable @typescript-eslint/no-explicit-any */
import DatePicker from "@/SuiDatePicker/date-picker";
import autobind from "autobind-decorator";
import moment, {Moment} from "moment";
import * as React from 'react';
import {RangePickerValue} from "@/compatibleTypes";
import {ICommonColumnSearchProps, LazyTableFilterRowCellProps} from "@/BaseTable";
import {GET_DEFAULT_CALENDAR_RANGES, getDataByKey} from '@sui/core';

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

const equals = (value1?: RangePickerValue, value2?: RangePickerValue): boolean => (!value1 || !value2)
  ? (value1 === value2)
  : (value1[0]?.valueOf() === value2[0]?.valueOf()) && ((value1[1]?.valueOf() === value2[1]?.valueOf()));

export class BaseDatetimeIntervalColumnFilter extends React.Component<FullBaseDatetimeIntervalColumnFilterProps, IBaseDatetimeIntervalColumnFilterState> {

  public constructor(props: FullBaseDatetimeIntervalColumnFilterProps) {
    super(props);

    const filterValue = this.propsFilterValueToStateFilterValue(this.props.filter?.value as unknown as string[]);

    this.state = {
      filterValue,
      lastSavedValue: filterValue
    };
  }

  public componentDidUpdate(): void {
    const value = this.propsFilterValueToStateFilterValue(this.props.filter?.value as unknown as string[]);

    if (!equals(value, this.state.lastSavedValue)) {
      this.setState({ lastSavedValue: value, filterValue: value });
    }
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
        value={this.state.filterValue}
        useFormatAsMask={true}
        onChange={this.onChange}
        onOpenChange={this.onOpenChange}
        open={this.state.open}
      />
    );
  }

  @autobind
  // Костыль
  private callUtc(): boolean {
    return getDataByKey(this.props.column, "__SUI_columnInfo", "columnType") !== "date"
  }

  @autobind
  private formatFilterToMoment(value: string | null): Moment | null {
    return value
      ? this.callUtc()
        ? moment.utc(value).local()
        : moment(value)
      : null
  }

  @autobind
  private formatMomentToFilter(ts: Moment | null, roundDay: "start" | "end" | null): string | null {
    if (ts) {
      let result = ts;

      if (roundDay === "start") {
        result = result.startOf('day');
      } else if (roundDay === "end") {
        result = result.endOf('day');
      }

      if (this.callUtc()) {
        result = result.utc()
      }

      return result.format(moment.HTML5_FMT.DATETIME_LOCAL_MS);
    }

    return null
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

        if (!equals(filterValue, lastSavedValue)) {
          this.triggerFilter(this.state.filterValue);
        }
      }
    });
  }

  @autobind
  private propsFilterValueToStateFilterValue(value?: string[]): RangePickerValue {
    const formattedValue = (value || []).map(it => this.formatFilterToMoment(it));

    return [formattedValue[0] ?? null, formattedValue[1] ?? null];
  }

  @autobind
  private triggerFilter(value: RangePickerValue): void {
    this.setState({lastSavedValue: value});

    const isDatePickMode = this.props.pickerMode === "date";

    this.props.onFilter({
      columnName: this.props.column.name,
      operation: "interval",
      value: [
        this.formatMomentToFilter(value && value[0] && value[0].clone(), isDatePickMode ? 'start' : null),
        this.formatMomentToFilter(value && value[1] && value[1].clone(), isDatePickMode ? 'end' : null)
      ] as any
    });
  }

}
