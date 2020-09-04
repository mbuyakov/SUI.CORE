import { CircularProgress, IconButton } from '@material-ui/core';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import Select, {SelectProps, SelectValue} from "antd/lib/select";
import * as React from "react";

import { SUI_ROW_GROW_LEFT } from '../styles';

import {IPromisedBaseProps, IPromisedBaseState, PromisedBase} from "./PromisedBase";
import {DisableEditContext} from "../DisableEditContext";

export type PromisedSelectProps<T> = IPromisedBaseProps<T> & Omit<SelectProps<T>, "onChange" | "value">

export class PromisedSelect<T extends SelectValue> extends PromisedBase<PromisedSelectProps<T>, IPromisedBaseState<T>, T> {

  public constructor(props: PromisedSelectProps<T>) {
    super(props);
    this.state = {
      savedValue: this.props.defaultValue,
      value: this.props.defaultValue,
    };
  }

  public render(): JSX.Element {
    const {promise, popconfirmSettings, ...selectProps} = this.props;
    const saveButton: JSX.Element = this.wrapConfirmAndError(
      <IconButton
        disabled={this.state.loading}
        onClick={this.saveWithoutValue}
        size="small"
      >
        {this.state.loading ? (<CircularProgress size={16} />) : (<SaveOutlinedIcon/>)}
      </IconButton>
      );
    const withPopover: JSX.Element = (
      <DisableEditContext.Consumer>
        {(disableEdit): JSX.Element => {
          return this.wrapInValidationPopover(
            <Select<T>
              // Typescript goes crazy. Mark as any to ignore
              {...selectProps as SelectProps<T> as any}
              disabled={disableEdit || this.props.disabled || this.props.loading || this.state.loading || false}
              onChange={this.onChange}
              value={this.state.value}
            />
          )
        }}
      </DisableEditContext.Consumer>
    );

    return (
      <div className={SUI_ROW_GROW_LEFT}>
        {withPopover}
        {this.state.savedValue !== this.state.value && saveButton}
      </div>
    );
  }

}
