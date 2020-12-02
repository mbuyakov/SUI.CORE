import {Input} from 'antd';
import {InputProps} from 'antd/lib/input';
import autobind from "autobind-decorator";
import React, {ChangeEvent} from "react";
import {Rules} from "async-validator";
import {MagicStrings} from "@/utils";

export type CustomInputWithRegexProps = InputProps & {
  desc?: string,
  regex?: string,

  onChange?(value: string): void
}

export class CustomInputWithRegex extends React.Component<CustomInputWithRegexProps>{

  public static enchantedValueValidator(rule: Rules, value: string, callback: (error: (string | string[])) => void): void {
    callback(MagicStrings.isEnchanted(value)
      ? MagicStrings.unspellAdditionalValues(value).join(" ")
      : "");
  }

  public componentDidUpdate(prevProps: Readonly<CustomInputWithRegexProps>): void {
    if (prevProps.regex && prevProps.regex !== this.props.regex) {
      const value = this.props.value || "";

      this.onChange({
        target: {
          value: MagicStrings.unspellValue(value as string),
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

    return value && typeof(value === "string") && MagicStrings.unspellValue(value as string) || "";
  }

  @autobind
  private onChange(e: ChangeEvent<HTMLInputElement>): void {
    let value = e.target.value;

    if(!RegExp(this.props.regex).test(value)) {
      value = this.props.disabled ? '' : MagicStrings.enchantValue(value, this.props.desc);
    }

    this.props.onChange(value);
  }

}
