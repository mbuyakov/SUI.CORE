import { Popover } from 'antd';
import Button from 'antd/lib/button';
import Input, { InputProps } from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import autobind from 'autobind-decorator';
import * as React from 'react';

import { trimIfString } from '../stringFormatters';
import { SUI_ROW_GROW_LEFT } from '../styles';
import { SUIMaskedInput } from '../SUIMaskedInput';

import { IPromisedBaseProps, IPromisedBaseState, PromisedBase } from './PromisedBase';
import { maskValidator } from './utils';

export type PromisedInputProps = {
  allowEmpty?: boolean;
  defaultValue?: string | number;
  disabled?: boolean;
  icon?: string;
  mask?: string;
  rowStyle?: React.CSSProperties;
  totalValueLength?: number;
  type?: 'text' | 'number';
  validator?(value: string): string | void;
} & IPromisedBaseProps<string | number>
  & Omit<InputProps, 'onChange' | 'value'>

export class PromisedInput extends PromisedBase<PromisedInputProps,
  IPromisedBaseState<string | number> & {
  validatorText: string
},
  string | number> {
  public constructor(props: PromisedInputProps) {
    super(props);
    this.state = {
      savedValue: this.props.defaultValue,
      validatorText: '',
      value: this.props.defaultValue,
    };
  }

  public render(): JSX.Element {
    const isEmptyAndEmptyNotAllowed = !this.props.allowEmpty && typeof this.state.value !== 'number' && !trimIfString(this.state.value);
    let saveButton: JSX.Element | null = (
      <Button
        type="primary"
        icon={this.state.loading ? 'loading' : this.props.icon || 'save'}
        disabled={this.state.loading || isEmptyAndEmptyNotAllowed || this.state.validatorText.length > 0}
        onClick={this.saveWithoutValue}
      />
    );
    saveButton = (this.state.savedValue !== this.state.value
      && (this.props.type === 'number' ? this.state.value !== '-' : true)
      && (isEmptyAndEmptyNotAllowed
          ? <Tooltip title="Нельзя сохранить пустое значение">{saveButton}</Tooltip>
          : saveButton
      ))
      || null;

    return (
      <div
        className={SUI_ROW_GROW_LEFT}
        style={this.props.rowStyle}
      >
        <Popover
          trigger="click"
          visible={this.state.validatorText.length > 0}
          content={this.state.validatorText}
        >
          {this.props.mask
            ? (
              <SUIMaskedInput
                {...this.props}
                mask={this.props.mask} // Don't delete
                disabled={this.props.disabled || this.state.loading}
                onChange={this.handleNewValue}
                value={this.state.value as string}
              />
            )
            : (
              <Input
                {...this.props}
                disabled={this.props.disabled || this.state.loading}
                onChange={this.handleNewValue}
                value={this.state.value}
              />
            )}

        </Popover>
        {saveButton && this.wrapConfirmAndError(saveButton)}
      </div>
    );
  }

  @autobind
  private handleNewValue(newValue: React.ChangeEvent<HTMLInputElement> | string): void {
    const value = typeof newValue === 'string' ? newValue : newValue.target.value;
    const validator = this.props.mask ? maskValidator(value, this.props.mask, this.props.totalValueLength, this.props.allowEmpty) : this.props.validator;
    if (validator) {
      this.setState({
        validatorText: validator(value) || '',
      });
    }
    const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
    // tslint:disable-next-line:no-any
    if (this.props.type === 'number' && !((!Number.isNaN(value as any) && reg.test(value)) || value === '' || value === '-')) {
      return;
    }
    this.setState({ value: this.props.type === 'number' ? (value ? (value === '-' ? '-' : Number(value)) : undefined) : value });
  }
}


