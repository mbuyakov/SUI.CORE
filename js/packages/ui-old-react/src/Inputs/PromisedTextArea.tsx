import {CircularProgress, IconButton} from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {trimIfString} from '@sui/ui-old-core';
import autobind from "autobind-decorator";
import * as React from "react";
import {Input, Tooltip} from "@sui/deps-antd";
import {SUI_ROW_GRID} from '@/styles';
import {TextAreaProps} from '@/antdMissedExport';

import {IPromisedBaseProps, IPromisedBaseState, PromisedBase} from "./PromisedBase";

export type PromisedTextAreaProps = {
  allowEmpty?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  icon?: JSX.Element;
  rowClassName?: string;
  rowStyle?: React.CSSProperties;
} & IPromisedBaseProps<string> & Omit<TextAreaProps, "onChange" | "value">

export class PromisedTextArea extends PromisedBase<PromisedTextAreaProps, IPromisedBaseState<string>, string> {

  public constructor(props: PromisedTextAreaProps) {
    super(props);
    this.state = {
      savedValue: this.props.defaultValue,
      value: this.props.defaultValue,
    };
  }

  public render(): JSX.Element {
    const isEmptyAndEmptyNotAllowed = !this.props.allowEmpty && !trimIfString(this.state.value);
    let saveButton: JSX.Element | null = (
      <IconButton
        disabled={this.state.loading || isEmptyAndEmptyNotAllowed || !this.isValidatorTextEmpty()}
        onClick={this.saveWithoutValue}
        size="small"
      >
        {this.state.loading ? (<CircularProgress size={16}/>) : (this.props.icon || <SaveOutlinedIcon/>)}
      </IconButton>
    );
    saveButton = (this.state.savedValue !== this.state.value)
      && (isEmptyAndEmptyNotAllowed ? <Tooltip title="Нельзя сохранить пустое значение">{saveButton}</Tooltip> : saveButton)
      || null;

    return (
      <div
        className={this.props.rowClassName || SUI_ROW_GRID}
        style={{
          gridTemplateColumns: "minmax(1px, 1fr) max-content",
          ...this.props.rowStyle
        }}
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
