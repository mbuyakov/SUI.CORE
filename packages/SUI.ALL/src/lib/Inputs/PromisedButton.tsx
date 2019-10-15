import Button, {BaseButtonProps} from "antd/lib/button/button";
import * as React from "react";

import {IPromisedBaseState, PromisedBase} from "./PromisedBase";

export class PromisedButton extends PromisedBase<BaseButtonProps & {
  disabled?: boolean;
  style?: React.CSSProperties;
},
  IPromisedBaseState<{}>,
  {}> {
  public render(): JSX.Element {
    const {promise, ...buttonProps} = this.props;
    const hasChild = this.props.children;

    return this.wrapConfirmAndError(
      <Button
        {...buttonProps}
        onClick={this.saveWithoutValue}
        loading={this.props.loading || (hasChild ? this.state.loading : undefined)}
        icon={!hasChild && this.state.loading ? "loading" : this.props.icon}
        disabled={this.props.disabled || (!hasChild && this.state.loading)}
      />
    );
  }
}