import {Button, ButtonProps} from "@sui/deps-antd";
import * as React from "react";

import {IPromisedBaseState, PromisedBase} from "./PromisedBase";

interface IPromisedButtonProps extends ButtonProps {
  disabled?: boolean;
  style?: React.CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class PromisedButton extends PromisedBase<IPromisedButtonProps, IPromisedBaseState<{}>, {}> {

  public render(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
