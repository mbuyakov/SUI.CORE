import {Input} from 'antd';
import {InputProps} from 'antd/lib/input';
import autobind from "autobind-decorator";
import React from "react";

import {fioConverterWithoutTrim} from "../validator";

function convertValue(value?: string): string | null | undefined {
  return value && fioConverterWithoutTrim(value);
}

export type CustomFioInputProps = InputProps & {}

export class CustomFioInput extends React.Component<CustomFioInputProps> {

  public componentDidUpdate(): void {
    const value = this.props.value && convertValue(this.props.value as string);

    if (this.props.value !== value) {
      this.onChange({target: {value}} as any);
    }
  }

  public render(): React.ReactNode {
    return (
      <Input
        {...this.props}
        onChange={this.onChange}
      />
    );
  }

  @autobind
  private onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const value = event.target.value && convertValue(event.target.value);

    this.props.onChange({
      ...event,
      target: {
        ...event.target,
        value
      }
    });
  }

}
