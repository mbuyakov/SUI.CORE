import {Popover} from "antd";
import Button from "antd/lib/button";
import Input, {TextAreaProps} from "antd/lib/input";
import Tooltip from "antd/lib/tooltip";
import autobind from "autobind-decorator";
import * as React from "react";

import {trimIfString} from '../stringFormatters';
import {SUI_ROW_GROW_LEFT} from '../styles';

import {IPromisedBaseProps, IPromisedBaseState, PromisedBase} from "./PromisedBase";

export type PromisedTextAreaProps = {
  allowEmpty?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  icon?: string;
  rowClassName?: string;
  rowStyle?: React.CSSProperties;
} & IPromisedBaseProps<string> & Omit<TextAreaProps, "onChange" | "value">

export class PromisedTextArea extends PromisedBase<PromisedTextAreaProps, IPromisedBaseState<string>, string> {

  public constructor(props: PromisedTextAreaProps) {
    super(props);
    this.state = {
      savedValue: this.props.defaultValue,
      validatorText: "",
      value: this.props.defaultValue,
    };
  }

  public render(): JSX.Element {
    const isEmptyAndEmptyNotAllowed = !this.props.allowEmpty && !trimIfString(this.state.value);
    let saveButton: JSX.Element | null = (
      <Button
        type="primary"
        icon={this.state.loading ? "loading" : this.props.icon || "save"}
        disabled={this.state.loading || isEmptyAndEmptyNotAllowed || this.state.validatorText.length > 0}
        onClick={this.saveWithoutValue}
      />
    );
    saveButton = (this.state.savedValue !== this.state.value)
      && (isEmptyAndEmptyNotAllowed ? <Tooltip title="Нельзя сохранить пустое значение">{saveButton}</Tooltip> : saveButton)
      || null;

    return (
      <div
        className={this.props.rowClassName || SUI_ROW_GROW_LEFT}
        style={this.props.rowStyle}
      >
        {this.wrapInValidationPopover(
          <Input.TextArea
            {...this.props}
            disabled={this.props.disabled || this.state.loading}
            onChange={this.handleNewValue}
            value={this.state.value}
          />
        )}
        {saveButton && this.wrapConfirmAndError(saveButton)}
      </div>
    );
  }

  @autobind
  private handleNewValue(newValue: React.ChangeEvent<HTMLTextAreaElement>): void {
    this.onChange(newValue.target.value);
  }

}
