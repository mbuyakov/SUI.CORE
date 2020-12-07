import MaskedInput from 'antd-mask-input';
import InputMask from "antd-mask-input/build/main/lib/inputmask-core";
import {MaskedInputProps} from 'antd-mask-input/build/main/lib/MaskedInput';
import autobind from 'autobind-decorator';
import React from 'react';
import {PHONE_MASK_LENGTH} from "@sui/all";

const PHONE_MASKS = [
  "+1(111)111-11-11",
  "1(111)111-11-11",
];

export type SUIPhoneInputProps = Omit<MaskedInputProps, 'onChange' | 'mask'> & {
  onChange?(value: string): void
}

export class SUIPhoneInput extends React.Component<SUIPhoneInputProps> {
  public static lengthValidator(value: string): string {
    if (!value) {
      return null;
    }
    return value.trim().length !== PHONE_MASK_LENGTH ? 'Необходимо указать все цифры номера' : null;
  }

  private static getFirsValidMask(value: string): string {
    if (!!value && (value.startsWith("+8") || value.startsWith("8"))) {
      return PHONE_MASKS[1];
    }
    return PHONE_MASKS[0];
  }

  private static getMaskedValue(mask: string, value: string): string {
    const mi = new InputMask({pattern: mask});
    mi.paste(value);
    const idx = mi.selection.start;
    return mi.getValue().substring(0, idx);
  }

  private readonly inputRef: React.RefObject<MaskedInput> = React.createRef<MaskedInput>();

  public componentDidUpdate(): void {
    this.setMask();
  }

  public render(): React.ReactNode {
    return (
      <MaskedInput
        {...this.props}
        value={this.props.value}
        mask={PHONE_MASKS[0]}
        ref={this.inputRef}
        onChange={this.onChange}
      />
    );
  }

  @autobind
  private onChange(): void {
    // this.props.onChange(this.inputRef.current.mask.getRawValue().replace(/[^\d]/g, ''));
    this.props.onChange(this.inputRef.current.mask.getRawValue().replace(/_/g, ''));
  }

  @autobind
  private setMask(): void {
    const newMask = SUIPhoneInput.getFirsValidMask(this.props.value);
    const oldMask = this.inputRef.current.mask.pattern.source;
    if (newMask !== oldMask) {
      const value = SUIPhoneInput.getMaskedValue(newMask, this.props.value);
      this.inputRef.current.mask.setPattern(newMask, {value: this.props.value});
      this.inputRef.current.setInputValue(value);
    }
  }
}
