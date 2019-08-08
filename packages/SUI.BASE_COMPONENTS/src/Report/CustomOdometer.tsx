/* tslint:disable:no-import-side-effect */
import "odometer/themes/odometer-theme-default.css";
import * as React from "react";
// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import Odometer from "react-odometerjs";

import {DIFFERENCE_ODOMETER, MAIN_ODOMETER, MINUS_ODOMETER, PLUS_ODOMETER, ZERO_ODOMETER} from "../styles";

export interface ICustomOdometerData {
  current: number;
  difference: number;
}

interface ICustomOdometerProps {
  className?: string;
  data?: ICustomOdometerData;
}

const odometerAnimationDuration = 500;

export class CustomOdometer extends React.Component<ICustomOdometerProps> {

  public render(): JSX.Element {
    const difference = this.props.data && this.props.data.difference || 0;

    return (
      <div className={this.props.className || undefined} style={{display: 'flex'}}>
        <div className={MAIN_ODOMETER}>
          <Odometer
            value={Math.abs(this.props.data && this.props.data.current || 0)}
            duration={odometerAnimationDuration}
            format="(,ddd).dd"
          />
        </div>
        <div className={`${(difference > 0 && PLUS_ODOMETER) || (difference < 0 && MINUS_ODOMETER) || ZERO_ODOMETER} ${DIFFERENCE_ODOMETER}`}>
          <Odometer
            value={Math.abs(difference)}
            duration={odometerAnimationDuration}
            format="(,ddd).dd"
          />
        </div>
      </div>
    );
  }

}
