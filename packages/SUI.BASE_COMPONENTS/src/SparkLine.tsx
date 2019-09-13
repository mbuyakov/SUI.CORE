/* tslint:disable:no-magic-numbers */
import {Color, defaultIfNotNumber} from "@smsoft/sui-core";
import * as React from "react";

export class SparkLine extends React.Component<{
  color: Color | string;
  max?: number;
  min?: number;
  precision?: number;
  value: number;
  width: number;
}> {
  public render(): JSX.Element {
    const precision = defaultIfNotNumber(this.props.precision, 2);
    const min = defaultIfNotNumber(this.props.min, 0);
    const max = defaultIfNotNumber(this.props.max, 100);
    const value = Math.max(min, Math.min(this.props.value, max));
    const barWidth = Math.max(0, (this.props.width - 10) * (value - min) / max);
    const colorString = this.props.color instanceof Color ? this.props.color.toRgba() : this.props.color;

    return (
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <svg width="${this.props.width}" height="50" version="1.1">
              <g>
                  <line stroke="#666" fill="none" x1="5" y1="25" x2="${this.props.width - 5}" y2="25"></line>
                  <g>
                      <g>
                          <line stroke="#666" fill="none" x1="5" y1="31" x2="5" y2="25"></line>
                          <text x="0" y="33" stroke="none" fill="#666" text-anchor="start">
                              <tspan x="0" dy="0.71em">${min}</tspan>
                          </text>
                      </g>
                      <text y="33" stroke="none" fill="#666" text-anchor="middle">
                              <tspan x="${this.props.width / 2}" dy="0.61em" font-size="1.15em">${typeof (this.props.value) === 'number' ? this.props.value.toFixed(precision) : this.props.value}</tspan>
                      </text>
                      <g>
                          <line stroke="#666" fill="none" x1="${this.props.width - 5}" y1="31" x2="${this.props.width - 5}" y2="25"></line>
                          <text x="${this.props.width}" y="33" stroke="none" fill="#666" text-anchor="end">
                              <tspan x="${this.props.width}" dy="0.71em">${max}</tspan>
                          </text>
                      </g>
                  </g>
              </g>
              <g>
                  <g>
                      <g>
                          <g>
                              <path fill="${colorString}" d="M 5,7 h ${barWidth} v 16 h -${barWidth} Z"></path>
                          </g>
                      </g>
                  </g>
              </g>
            </svg>`
        }}
      />
    );
  }
}
