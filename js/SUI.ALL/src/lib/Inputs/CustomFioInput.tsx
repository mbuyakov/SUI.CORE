/* tslint:disable */
import {Input} from 'antd';
import {InputProps} from 'antd/lib/input';
import autobind from "autobind-decorator";
import React from "react";
import {fioConverterWithoutTrim} from "../validator";

function convertValue(value?: string): string | null | undefined {
  return value && fioConverterWithoutTrim(value);
}

export type CustomFioInputProps = InputProps & {
}

export type CustomFioInputState = {
  value?: string;
}

export class CustomFioInput extends React.Component<CustomFioInputProps, CustomFioInputState> {

  public constructor(props: CustomFioInputProps) {
    super(props);
    this.state = {value: convertValue(props.value as string)}
  }

  public componentDidMount(): void {
    this.doOnDid();
  }

  public componentDidUpdate(): void {
    this.doOnDid();
  }

  public render(): React.ReactNode {
    return (
      <Input
        {...this.props}
        value={this.state.value}
        onChange={this.onChange}
      />
    );
  }

  @autobind
  private doOnDid(): void {
    if (this.props.value !== this.state.value) {
      this.props.onChange({target: {value: this.state.value}} as any)
    }
  }

  @autobind
  private onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.props.onChange({
      ...event,
      target: {
        ...event.target,
        value: convertValue(event.target.value)
      }
    });
  }

}
