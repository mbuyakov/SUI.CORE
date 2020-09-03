import Switch, {SwitchProps} from "antd/lib/switch";
import autobind from "autobind-decorator";
import * as React from "react";

import {IPromisedBaseProps, IPromisedBaseState, PromisedBase} from "./PromisedBase";
import { DisableEditContext } from "../DisableEditContext";

export type PromisedSwitchProps = Omit<IPromisedBaseProps<boolean>, "validator"> & Omit<SwitchProps, "checked" | "loading" | "onChange">;

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
    const {promise, popconfirmSettings, ...switchProps} = this.props;

    return this.wrapConfirmAndError(
      <DisableEditContext.Consumer>
        {(disableEdit): JSX.Element => {
          return (
            <Switch
              {...switchProps}
              checked={this.state.savedValue}
              loading={this.state.loading}
              onChange={this.save}
              disabled={disableEdit || this.props.disabled}
            />
          );
        }}
      </DisableEditContext.Consumer>
    );
  }

}
