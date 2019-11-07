import MaskedInput from 'antd-mask-input';
import { MaskedInputProps } from 'antd-mask-input/build/main/lib/MaskedInput';
import autobind from 'autobind-decorator';
import React from 'react';

export type MyMaskedInputProps = Omit<MaskedInputProps, 'onChange'> & {
  onChange?(value: string): void
}

export class MyMaskedInput extends React.Component<MyMaskedInputProps> {
  private readonly inputRef: React.RefObject<MaskedInput> = React.createRef<MaskedInput>();

  public componentDidMount(): void {
    this.inputRef.current.mask.setValue(this.props.value);
  }

  public componentDidUpdate(): void {
    this.inputRef.current.mask.setValue(this.props.value);
  }

  public render(): React.ReactNode {
    return (
      <MaskedInput
        mask={this.props.mask}
        ref={this.inputRef}
        onChange={this.onChange}
      />
    )
  }

  @autobind
  private onChange(): void {
    this.props.onChange(this.inputRef.current.mask.getValue());
  }
}
