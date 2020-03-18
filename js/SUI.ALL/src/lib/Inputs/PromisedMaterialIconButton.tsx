import { CircularProgress, IconButton, Tooltip } from '@material-ui/core';
import * as React from 'react';

import { IPromisedBaseState, PromisedBase } from './PromisedBase';

export class PromisedMaterialIconButton extends PromisedBase<{
  disabled?: boolean;
  icon?: JSX.Element;
  loading?: boolean;
  progressColor?: 'primary' | 'secondary';
  size?: 'small' | 'medium';
  tooltipText?: string;
},
  IPromisedBaseState<{}>,
  {}> {

  public render(): JSX.Element {
    let btn = (
      <IconButton onClick={this.saveWithoutValue} size={this.props.size} disabled={this.props.disabled}>
        {(this.props.loading || this.state.loading) ? <CircularProgress size={this.props.size === 'small' ? 16 : 24} color={this.props.progressColor}/> : (this.props.children || this.props.icon)}
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
