import {AfterChangeContext} from '@/AfterChangeContext';
import Switch, {SwitchProps} from "antd/lib/switch";
import autobind from "autobind-decorator";
import * as React from "react";

// noinspection ES6PreferShortImport
import {DisableEditContext} from "../DisableEditContext";

import {IPromisedBaseProps, IPromisedBaseState, PromisedBase} from "./PromisedBase";

export type PromisedSwitchProps = { allowDisableEdit?: boolean } & Omit<IPromisedBaseProps<boolean>, "validator"> & Omit<SwitchProps, "checked" | "loading" | "onChange">;

export class PromisedSwitch extends PromisedBase<PromisedSwitchProps, IPromisedBaseState<boolean>, boolean> {


  public constructor(props: PromisedSwitchProps) {
    super(props);
    this.state = {
      savedValue: this.props.defaultChecked,
    };
  }

  @autobind
  public componentWillReceiveProps(nextProps: PromisedSwitchProps): void {
    if (typeof this.props.defaultChecked !== "undefined" && this.props.defaultChecked !== nextProps.defaultChecked) {
      this.setState({savedValue: nextProps.defaultChecked, loading: false});
    }
  }

  public render(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {promise, popconfirmSettings, ...switchProps} = this.props;

    return (
      <AfterChangeContext.Consumer>
        {(afterChange): JSX.Element => {
          this.setAfterChange(afterChange);
          return (
            <DisableEditContext.Consumer>
              {(disableEdit): JSX.Element => {
                return this.wrapConfirmAndError(
                  <Switch
                    {...switchProps}
                    checked={this.state.savedValue}
                    loading={this.state.loading}
                    onChange={this.save}
                    disabled={this.props.allowDisableEdit ? false : disableEdit || switchProps?.disabled}
                  />
                );
              }}
            </DisableEditContext.Consumer>
          );
        }}
      </AfterChangeContext.Consumer>
    );
  }
}
