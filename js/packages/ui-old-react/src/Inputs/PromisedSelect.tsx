import {CircularProgress, IconButton} from "@sui/deps-material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import * as React from "react";
import {Select, SelectProps} from "@sui/deps-antd";
import {SUI_ROW_GRID} from "@/styles";
import {DisableEditContext} from "@/DisableEditContext";

import {SelectValue} from "@/antdMissedExport";
import {IPromisedBaseProps, IPromisedBaseState, PromisedBase} from "./PromisedBase";

export type PromisedSelectProps<T> = IPromisedBaseProps<T> & Omit<SelectProps<T>, "onChange" | "value">;

export class PromisedSelect<T extends SelectValue> extends PromisedBase<PromisedSelectProps<T>, IPromisedBaseState<T>, T> {

  public constructor(props: PromisedSelectProps<T>) {
    super(props);
    this.state = {
      savedValue: this.props.defaultValue,
      value: this.props.defaultValue,
    };
  }

  public render(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {promise, popconfirmSettings, ...selectProps} = this.props;
    const saveButton: JSX.Element = this.wrapConfirmAndError(
      <IconButton
        disabled={this.state.loading || !this.isValidatorTextEmpty()}
        onClick={this.saveWithoutValue}
        size="small"
      >
        {this.state.loading ? (<CircularProgress size={16}/>) : (<SaveOutlinedIcon/>)}
      </IconButton>
    );
    const withPopover: JSX.Element = (
      <DisableEditContext.Consumer>
        {(disableEdit): JSX.Element => {
          return this.wrapInValidationPopover(
            <Select<T>
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              {...selectProps as SelectProps<T> as unknown}
              disabled={disableEdit || this.props.disabled || this.props.loading || this.state.loading || false}
              onChange={this.onChange}
              value={this.state.value}
            />
          );
        }}
      </DisableEditContext.Consumer>
    );

    return (
      <div
        className={SUI_ROW_GRID}
        style={{gridTemplateColumns: "minmax(1px, 1fr) max-content"}}
      >
        {withPopover}
        {this.state.savedValue !== this.state.value && saveButton}
      </div>
    );
  }

}
