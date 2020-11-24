import {Input} from 'antd';
import {InputProps} from 'antd/lib/input';
import autobind from "autobind-decorator";
import React, {ChangeEvent} from "react";
import {Rules} from "async-validator";

export const MAGIC = "___!___";

export type CustomInputWithRegexProps = InputProps & {
  desc?: string,
  regex?: string,
  value?: string,

  onChange?(value: string): void
}

export class CustomInputWithRegex extends React.Component<CustomInputWithRegexProps>{

  public static enchantedValueValidator(rule: Rules, value: string, callback: (error: (string | string[])) => void): void {
    callback(value.startsWith(MAGIC) ? value.split(MAGIC)[1] : "");
  }

  public componentDidUpdate(prevProps: Readonly<CustomInputWithRegexProps>): void {
    if (prevProps.regex && prevProps.regex !== this.props.regex) {
      const value = this.props.value || "";

      this.onChange({
        target: {
          value: value && (value as string).split(MAGIC)[(value as string).split(MAGIC).length - 1]
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
    const splittedValue = value && typeof(value === "string") && (value as string).split(MAGIC);

    return splittedValue && splittedValue[splittedValue.length - 1] || "";
  }

  @autobind
  private onChange(e: ChangeEvent<HTMLInputElement>): void {
    let value = e.target.value;

    if(!RegExp(this.props.regex).test(value)) {
      value = this.props.disabled ? '' : MAGIC + this.props.desc + MAGIC + value;
    }

    this.props.onChange(value);
  }

}
