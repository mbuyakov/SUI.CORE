import MaskedInput from 'antd-mask-input';
import { MaskedInputProps } from 'antd-mask-input/build/main/lib/MaskedInput';
import autobind from 'autobind-decorator';
import React from 'react';

export type MyMaskedInputProps = Omit<MaskedInputProps, 'onChange'> & {
  onChange?(value: string): void
}

export class SUIMaskedInput extends React.Component<MyMaskedInputProps> {
  private readonly inputRef: React.RefObject<MaskedInput> = React.createRef<MaskedInput>();

  public componentDidMount(): void {
    this.inputRef.current.state.mask.setValue(this.props.value);
  }

  public componentDidUpdate(): void {
    this.inputRef.current.state.mask.setValue(this.props.value);
  }

  public render(): React.ReactNode {
    return (
      <MaskedInput
        {...this.props}
        mask={this.props.mask}
        ref={this.inputRef}
        onChange={this.onChange}
      />
    )
  }

  @autobind
  private onChange(): void {
    // this.props.onChange(this.inputRef.current.mask.getRawValue().replace(/[^\d]/g, ''));
    this.props.onChange(this.inputRef.current.state.mask.getRawValue().replace(/_/g, ''));
  }
}
