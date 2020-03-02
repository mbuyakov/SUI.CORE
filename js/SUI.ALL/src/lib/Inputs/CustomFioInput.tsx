/* tslint:disable */
import {Input} from 'antd';
import {InputProps} from 'antd/lib/input';
import React from "react";
import {fioConverterWithoutTrim} from "../validator";
export type CustomFioInputProps = InputProps & {
}

export class CustomFioInput extends React.Component<CustomFioInputProps> {

  public render(): React.ReactNode {
    return (
      <Input
        value={this.props.value && fioConverterWithoutTrim(this.props.value as string)}
      />
    );
  }

}
