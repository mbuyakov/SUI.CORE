import {Input} from 'antd';
import {InputProps} from 'antd/lib/input';
import autobind from "autobind-decorator";
import React, {ChangeEvent} from "react";
import {Rules} from "async-validator";
import {StringWithError} from "@/utils";

export type CustomInputWithRegexProps = InputProps & {
  desc?: string,
  regex?: string,
  checkDisabled?: boolean;

  onChange?(value: string): void
}

export class CustomInputWithRegex extends React.Component<CustomInputWithRegexProps>{

  public static stringWithErrorValidator(rule: Rules, value: string, callback: (error: (string | string[])) => void): void {
    callback(StringWithError.getError(value));
  }

  public componentDidUpdate(prevProps: Readonly<CustomInputWithRegexProps>): void {
    if (prevProps.regex !== this.props.regex) {
      const value = this.props.value || "";

      this.onChange({
        target: {
          value: StringWithError.getValue(value as string),
        }
      } as any);
    }
  }

  public render(): React.ReactNode {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {regex, desc, ...rest} = this.props;

    return (
      <Input
        {...rest}
        value={this.getValue()}
        onChange={this.onChange}
      />
    );
  }

  @autobind
  private getValue(): string | undefined {
    const value = this.props.value;

    return value && typeof(value === "string") && StringWithError.getValue(value as string) || "";
  }

  @autobind
  private onChange(e: ChangeEvent<HTMLInputElement>): void {
    let value = e.target.value;

    if ((this.props.checkDisabled || !this.props.disabled) && !RegExp(this.props.regex).test(value)) {
      value = StringWithError.pack(value, this.props.desc);
    }

    this.props.onChange(value);
  }

}
