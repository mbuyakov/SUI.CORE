import {Omit, SUI_ROW_GROW_LEFT} from "@smsoft/sui-core";
import {Button, DatePicker} from "antd";
import {DatePickerProps} from "antd/lib/date-picker/interface";
import moment from 'moment';
import * as React from "react";

import {IPromisedBaseProps, IPromisedBaseState, PromisedBase} from "./PromisedBase";

export type PromisedDatepickerProps = IPromisedBaseProps<moment.Moment | null> & Omit<DatePickerProps, "onChange" | "value">

export class PromisedDatepicker extends PromisedBase<PromisedDatepickerProps, IPromisedBaseState<moment.Moment | null>, moment.Moment | null> {
  public constructor(props: PromisedDatepickerProps) {
    super(props);
    this.state = {
      savedValue: this.props.defaultValue,
      value: this.props.defaultValue,
    };
  }

  public render(): JSX.Element {
    const {promise, popconfirmSettings, ...selectProps} = this.props;
    const saveButton: JSX.Element = this.wrapConfirmAndError(<Button type="primary" icon={this.state.loading ? "loading" : "save"} disabled={this.state.loading} onClick={this.saveWithoutValue}/>);

    return (
      <div className={SUI_ROW_GROW_LEFT}>
        <DatePicker
          {...selectProps as DatePickerProps}
          disabled={this.props.disabled || this.state.loading}
          onChange={this.onChange}
          value={this.state.value as moment.Moment}
        />
        {this.state.savedValue !== this.state.value && saveButton}
      </div>
    );
  }
}