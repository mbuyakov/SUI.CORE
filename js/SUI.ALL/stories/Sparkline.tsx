/* tslint:disable:no-default-export */

import * as colors from '@material-ui/core/colors';
import * as React from 'react';

import { Color, getLevelColor, initPercentToColor } from '../src/color';
// tslint:disable-next-line:no-import-side-effect
import '../styles/index.less';



export const red = Color.fromHex(colors.deepOrange['400']);
export const yellow = Color.fromHex(colors.yellow['400']);
export const green = Color.fromHex(colors.lightBlue['200']);


initPercentToColor({
  center: Color.fromHex("#FCF69B"),
  left: Color.fromHex("#A2E8AB"),
  right: Color.fromHex("#FF8E8E"),
});

class NewSparkline extends React.Component<{
  value: number
}> {
  public render(): JSX.Element {
    return (
      <div className="SPARKLINE">
        <div className="SPARKLINE-VALUE" style={{ width: `calc(${Math.min(this.props.value, 100)}% + 4px)`, backgroundColor: getLevelColor(this.props.value).toRgba() }}/>
        <div className="SPARKLINE-LABEL">
          <span>{this.props.value.toFixed(1)}</span>
        </div>
      </div>
    );
  }
}

export default class Sparkline extends React.Component<{}> {
  public render(): JSX.Element {
    return (
      <>
        <style>
          {`
            .SUI {
              width: 300px;
            }
            .SUI .SPARKLINE {
              margin: 20px;
            }
            .SUI .SPARKLINE {
              border: 2px solid #DFDFDF;
              border-radius: 8px;
              height: 32px;
              font-size: 14px;
              position: relative;
            }
            .SUI .SPARKLINE > * {
              position: absolute;
              top: 0;
              left: 0;
              margin-top: -2px;
              margin-left: -2px;
            }
            .SUI .SPARKLINE-LABEL {
              display: flex;
              justify-content: center;
              align-items: center;
              width: calc(100% + 4px);
              height: calc(100% + 4px);
            }
            .SUI .SPARKLINE-VALUE {
              border: 0px solid #DFDFDF;
              border-radius: 8px;
              height: 32px;
              min-width: 12px;
            }
          `}
        </style>
        <div className="SUI">
          <NewSparkline value={0}/>
          <NewSparkline value={1}/>
          <NewSparkline value={25}/>
          <NewSparkline value={50}/>
          <NewSparkline value={70}/>
          <NewSparkline value={100}/>
        </div>
      </>
    );
  }
};
