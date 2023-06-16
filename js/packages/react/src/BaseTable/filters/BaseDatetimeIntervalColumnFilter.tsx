/* eslint-disable @typescript-eslint/no-explicit-any */
import autobind from "autobind-decorator";
import moment, {Moment} from "moment";
import * as React from "react";
import {GET_DEFAULT_CALENDAR_RANGES} from "@sui/core";
import {RangePickerValue} from "@/compatibleTypes";
import {ICommonColumnSearchProps, LazyTableFilterRowCellProps} from "@/BaseTable";
import {SuiRangePicker} from "@/Inputs/SuiRangePicker";

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
      this.setState({lastSavedValue: value, filterValue: value});
    }
  }

  public render(): JSX.Element {
    return (
      <SuiRangePicker
        {...this.props}
        allowClear={true}
        placeholder={this.props.placeholder as [string, string] || ["Начало", "Конец"]}
        style={{width: "100%"}}
        showTime={this.props.pickerMode === "datetime"}
        ranges={GET_DEFAULT_CALENDAR_RANGES()}
        value={this.state.filterValue}
        onChange={this.onChange}
        onOpenChange={this.onOpenChange}
        open={this.state.open}
        formatter={(value, event): string => {
          if (this.props.format) {
            const inputType = event.inputType as string;

            if (inputType.startsWith("insert")) {
              return formatter(value, this.props.format, true);
            } else if (inputType.startsWith("delete")) {
              return formatter(value, this.props.format, false);
            }
          }

          return value;
        }}
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

        if (!equals(filterValue, lastSavedValue)) {
          this.triggerFilter(this.state.filterValue);
        }
      }
    });
  }

  @autobind
  private propsFilterValueToStateFilterValue(value?: string[]): RangePickerValue {
    return [
      (value && value[0]) ? moment(value[0]).local() : null,
      (value && value[1]) ? moment(value[1]).local() : null
    ];
  }

  @autobind
  private triggerFilter(value: RangePickerValue): void {
    this.setState({lastSavedValue: value});

    const convertValue = (momentValue: Moment): string => {
      return (this.props.column as any)?.__SUI_columnInfo?.columnType === "date"
        ? momentValue.clone().local().format(moment.HTML5_FMT.DATE)
        : momentValue.toISOString();
    };

    this.props.onFilter({
      columnName: this.props.column.name,
      operation: "interval",
      value: [
        (value && value[0]) ? convertValue(value[0]) : null,
        (value && value[1]) ? convertValue(value[1]) : null
      ] as any
    });
  }

}

function formatter(value: string, format: string, insert: boolean): string {
  const valueDigits = value.replace(/[^0-9]+/g, '');

  if (!insert && valueDigits.length == 0) {
    return "";
  }

  const formattedNow = moment().format(format);

  let result = "";
  let resultDigitCount = 0;

  for (let char of formattedNow) {
    const isDigit = char >= "0" && char <= "9";

    if (!isDigit) {
      result += char;
      // eslint-disable-next-line no-continue
      continue;
    }

    if (insert) {
      if (valueDigits.length === resultDigitCount) {
        break;
      } else {
        result += valueDigits.charAt(resultDigitCount);
        resultDigitCount++;
      }
    } else {
      result += valueDigits.charAt(resultDigitCount);
      resultDigitCount++;

      if (valueDigits.length === resultDigitCount) {
        break;
      }
    }
  }

  return result;
}
