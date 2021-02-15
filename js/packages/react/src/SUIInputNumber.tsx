import {InputNumber} from 'antd';
import {InputNumberProps} from "antd/lib/input-number";
import React from "react";
import autobind from "autobind-decorator";

export class SUIInputNumber extends React.Component<InputNumberProps> {

  private prevValue = undefined;

  public render(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (<InputNumber formatter={this.formatter} {...this.props} onChange={() => {}}/>)
  }

  @autobind
  private formatter(value: string): string {
    const numberValue = Number(value);

    // Not changed
    if (value == this.prevValue || numberValue === this.props.value || value === this.props.value as unknown as string) {
      return value;
    }

    // Blank or valid
    if (!value || /^[0-9]+\.?[0-9]*$/.test(value)) {
      this.prevValue = value;

      if (this.props.onChange) {
        this.props.onChange(!value ? null : numberValue);
      }
    } else {
      value = this.prevValue;
    }

    return value;
  }
}
