import {DatePicker} from "antd";
import autobind from "autobind-decorator";
import moment, {Moment} from "moment";
import { RangeValue } from 'rc-picker/lib/interface';
import * as React from 'react';

import {GET_DEFAULT_CALENDAR_RANGES} from "../../const";
import {ICommonColumnSearchProps, LazyTableFilterRowCellProps} from "../types";

type DatetimeFilterType = "date" | "datetime";

interface IBaseDatetimeIntervalColumnFilterProps {
  format?: string;
  pickerMode: DatetimeFilterType;
}

interface IBaseDatetimeIntervalColumnFilterState {
  filterValue?: RangeValue<Moment> | null;
  lastSavedValue?: RangeValue<Moment> | null;
  open?: boolean;
}

type FullBaseDatetimeIntervalColumnFilterProps = LazyTableFilterRowCellProps
  & IBaseDatetimeIntervalColumnFilterProps
  & ICommonColumnSearchProps;

export class BaseDatetimeIntervalColumnFilter
  extends React.Component<FullBaseDatetimeIntervalColumnFilterProps, IBaseDatetimeIntervalColumnFilterState> {

  public constructor(props: FullBaseDatetimeIntervalColumnFilterProps) {
    super(props);
    const propsFilterValue = this.props.filter && (this.props.filter.value as unknown as string[]);
    const filterValue = propsFilterValue && propsFilterValue.map(value => value && moment.utc(value).local()) as RangeValue<Moment>;

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
  private onChange(filterValue: RangeValue<Moment>): void {
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
  private triggerFilter(value: RangeValue<Moment> | null | undefined): void {
    const format = moment.HTML5_FMT.DATETIME_LOCAL_MS;

    this.setState({lastSavedValue: value});

    const isDatePickMode = this.props.pickerMode === "date";
    const start = value && value[0] && value[0].clone();
    const end = value && value[1] && value[1].clone();

    this.props.onFilter({
      columnName: this.props.column.name,
      operation: "interval",
      value: [
        start ? (isDatePickMode ? start.startOf('day') : start).utc().format(format) : null,
        end ? (isDatePickMode ? end.endOf('day') : end).utc().format(format) : null,
        // tslint:disable-next-line:no-any
      ] as any
    });
  }

}
