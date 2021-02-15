import {InputNumber} from 'antd';
import {InputNumberProps} from "antd/lib/input-number";
import React from "react";
import autobind from "autobind-decorator";

export class SUIInputNumber extends React.Component<InputNumberProps> {

  private prevValue = ""

  public render(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (<InputNumber formatter={this.formatter} {...this.props} onChange={() => {}}/>)
  }

  @autobind
  private formatter(value: string): string {
    if (value == this.prevValue) {
      return value;
    }

    if (!value || /^[0-9]+\.?[0-9]*$/.test(value)) {
      this.prevValue = value;
      if (this.props.onChange) {
        this.props.onChange(Number(value));
      }
    } else {
      value = this.prevValue;
    }

    return value;
  }
}
