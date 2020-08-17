import Button, {ButtonProps} from "antd/lib/button/button";
import * as React from "react";

import {IPromisedBaseState, PromisedBase} from "./PromisedBase";

export class PromisedButton extends PromisedBase<ButtonProps & {
  disabled?: boolean;
  style?: React.CSSProperties;
},
  IPromisedBaseState<{}>,
  {}> {

  public render(): JSX.Element {
    const {promise, ...buttonProps} = this.props;

    return this.wrapConfirmAndError(
      <Button
        {...buttonProps}
        onClick={this.saveWithoutValue}
        loading={this.props.loading || this.state.loading}
      />
    );
  }

}
