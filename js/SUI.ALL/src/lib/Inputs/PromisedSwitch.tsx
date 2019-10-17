import Switch, {SwitchProps} from "antd/lib/switch";
import autobind from "autobind-decorator";
import * as React from "react";

import {IPromisedBaseProps, IPromisedBaseState, PromisedBase} from "./PromisedBase";

export type PromisedSwitchProps = IPromisedBaseProps<boolean> & Omit<SwitchProps, "checked" | "loading" | "onChange">;

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
      <Switch
        {...switchProps}
        checked={this.state.savedValue}
        loading={this.state.loading}
        onChange={this.save}
      />
    );
  }
}
