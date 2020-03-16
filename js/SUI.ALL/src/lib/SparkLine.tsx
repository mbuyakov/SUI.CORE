/* tslint:disable:no-magic-numbers */
import * as React from "react";

import { Color, getLevelColor } from './color';
import { defaultIfNotNumber } from './typeWrappers';

export class SparkLine extends React.Component<{
  value: number;
}> {
  public render(): JSX.Element {
    return (
      <div className="SPARKLINE">
        <div className="SPARKLINE-VALUE" style={{ width: `calc(${Math.min(this.props.value, 100)}% + 4px)`, backgroundColor: getLevelColor(this.props.value).toRgba() }}/>
        <div className="SPARKLINE-LABEL">
          <span>{this.props.value.toFixed(2)}</span>
        </div>
      </div>
    );
  }
}
