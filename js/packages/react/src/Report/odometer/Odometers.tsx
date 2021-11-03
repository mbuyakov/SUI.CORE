import React from "react";

import {CustomOdometer, ICustomOdometerData} from "./CustomOdometer";

export interface IOdometerDefinition {
  containerStyle?: React.CSSProperties;
  disableDifferenceOdometer?: boolean;
  id: string;
  odometerClassName?: string;
  title: string | JSX.Element;
}

export interface IOdometersProps {
  commonSectionStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  data: Map<IOdometerDefinition["id"], ICustomOdometerData>;
  odometerDefinition: IOdometerDefinition[];
  format?: string;
}

export const defaultSectionStyle = {
  alignItems: 'center',
  display: 'flex',
  flexFlow: 'column'
};

export class Odometers extends React.Component<IOdometersProps> {

  public render(): JSX.Element {
    return (
      <div
        style={this.props.containerStyle}
      >
        {this.props.odometerDefinition.map(definition => {
          const {id, containerStyle, ...customOdometerProps} = definition;

          return (
            <div
              key={id}
              style={{
                ...containerStyle,
                ...this.props.commonSectionStyle
              }}
            >
              <CustomOdometer
                {...customOdometerProps}
                className={customOdometerProps.odometerClassName}
                data={this.props.data.get(definition.id)}
                format={this.props.format}
              />
              <div>{definition.title}</div>
            </div>
          )
        })}
      </div>
    );
  }

}
