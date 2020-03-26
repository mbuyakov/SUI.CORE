import { Icon } from '@ant-design/compatible';
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
    const hasChild = this.props.children;

    return this.wrapConfirmAndError(
      <Button
        {...buttonProps}
        onClick={this.saveWithoutValue}
        loading={this.props.loading || (hasChild ? this.state.loading : undefined)}
        icon={!hasChild && this.state.loading ? <Icon type="loading"/> : this.props.icon}
        disabled={this.props.disabled || (!hasChild && this.state.loading)}
      />
    );
  }

}
