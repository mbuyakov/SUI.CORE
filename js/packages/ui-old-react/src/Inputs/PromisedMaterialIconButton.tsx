import {CircularProgress, IconButton, IconButtonProps, Tooltip} from "@mui/material";
import * as React from "react";

import {IPromisedBaseState, PromisedBase} from "./PromisedBase";

interface IPromisedMaterialIconButtonProps extends IconButtonProps {
  icon?: JSX.Element;
  loading?: boolean;
  progressColor?: "primary" | "secondary";
  tooltipText?: string;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class PromisedMaterialIconButton extends PromisedBase<IPromisedMaterialIconButtonProps, IPromisedBaseState<{}>, {}> {

  public render(): JSX.Element {
    let btn = (
      <IconButton onClick={this.saveWithoutValue} {...this.props} size="large">
        {(this.props.loading || this.state.loading) ? <CircularProgress size={this.props.size === "small" ? 16 : 24} color={this.props.progressColor}/> : (this.props.children || this.props.icon)}
      </IconButton>
    );

    if (this.props.tooltipText) {
      btn = (
        <Tooltip title={this.props.tooltipText} placement="bottom" enterDelay={300}>
          {btn}
        </Tooltip>
      );
    }

    return this.wrapConfirmAndError(btn);
  }

}
