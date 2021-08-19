import {CircularProgress, IconButton} from '@material-ui/core';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import {DatePicker} from 'antd';
import {DatePickerProps} from 'antd/lib/date-picker';
import moment from 'moment';
import * as React from 'react';
import {SUI_ROW_GRID} from '@/styles';

import {IPromisedBaseProps, IPromisedBaseState, PromisedBase} from './PromisedBase';

export type PromisedDatepickerProps = IPromisedBaseProps<moment.Moment | null> & Omit<DatePickerProps, "onChange" | "value">

export class PromisedDatepicker extends PromisedBase<PromisedDatepickerProps,
  IPromisedBaseState<moment.Moment | null>,
  moment.Moment | null> {

  public constructor(props: PromisedDatepickerProps) {
    super(props);
    this.state = {
      ...this.state,
      savedValue: this.props.defaultValue,
      value: this.props.defaultValue,
    };
  }

  public render(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {promise, popconfirmSettings, ...selectProps} = this.props;
    const saveButton: JSX.Element = this.wrapConfirmAndError(
      <IconButton
        disabled={this.state.loading}
        onClick={this.saveWithoutValue}
        size="small"
      >
        {this.state.loading ? (<CircularProgress size={16}/>) : (<SaveOutlinedIcon/>)}
      </IconButton>
    );
    const datePickerWithPopover: JSX.Element = this.wrapInValidationPopover(
      <DatePicker
        {...selectProps as DatePickerProps}
        disabled={this.props.disabled || this.state.loading}
        onChange={this.onChange}
        value={this.state.value}
      />
    );

    return (
      <div
        className={SUI_ROW_GRID}
        style={{gridTemplateColumns: "minmax(1px, 1fr) max-content"}}
      >
        {datePickerWithPopover}
        {this.state.savedValue !== this.state.value && saveButton}
      </div>
    );
  }

}
