/* tslint:disable:no-magic-numbers */
import {SUI_ROW_GRID} from "@/styles";
import {CircularProgress, IconButton} from '@material-ui/core';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import {Slider} from "antd";
import {SliderSingleProps} from "antd/lib/slider";
import * as React from "react";
import {IPromisedBaseProps, IPromisedBaseState, PromisedBase} from "./PromisedBase";

export type PromisedSliderProps = Omit<IPromisedBaseProps<number>, "validator"> & Omit<SliderSingleProps, "value" | "onChange">;

export class PromisedSlider extends PromisedBase<PromisedSliderProps, IPromisedBaseState<number>, number> {

  public constructor(props: PromisedSliderProps) {
    super(props);
    this.state = {
      savedValue: this.props.defaultValue,
      value: this.props.defaultValue,
    };
  }

  public render(): JSX.Element {
    const {promise, popconfirmSettings, ...sliderProps} = this.props;

    const saveButton: JSX.Element = this.wrapConfirmAndError(
      <IconButton
        disabled={this.state.loading || (this.state.savedValue === this.state.value)}
        onClick={this.saveWithoutValue}
        size="small"
      >
        {this.state.loading ? (<CircularProgress size={16}/>) : (<SaveOutlinedIcon/>)}
      </IconButton>
    );

    return (
      <div
        className={SUI_ROW_GRID}
        style={{gridTemplateColumns: "1fr max-content"}}
      >
        <Slider
          {...sliderProps}
          disabled={this.props.disabled || this.state.loading || false}
          value={this.state.value}
          onChange={this.onChange}
        />
        {saveButton}
      </div>
    );
  }

}
