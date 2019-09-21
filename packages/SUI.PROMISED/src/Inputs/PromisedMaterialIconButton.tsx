import { CircularProgress, IconButton, Tooltip } from '@material-ui/core';
import * as React from 'react';

import { IPromisedBaseState, PromisedBase } from './PromisedBase';

export class PromisedMaterialIconButton extends PromisedBase<{
  progressColor?: 'primary' | 'secondary';
  tooltipText?: string;
},
  IPromisedBaseState<{}>,
  {}> {
  public render(): JSX.Element {
    let btn = (
      <IconButton onClick={this.saveWithoutValue}>
        {this.state.loading ? <CircularProgress size={24} color={this.props.progressColor}/> : this.props.children}
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
