import Button from 'antd/lib/button';
import Input, {InputProps} from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import autobind from 'autobind-decorator';
import * as React from 'react';

import {Rendered} from "../other";
import {trimIfString} from '../stringFormatters';
import {SUI_ROW_GROW_LEFT} from '../styles';
import {SUIMaskedInput} from '../SUIMaskedInput';

import {IPromisedBaseProps, IPromisedBaseState, PromisedBase, ValidatorFunction} from './PromisedBase';

const NUMBER_REGEX: RegExp = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;

export type PromisedInputProps = {
  allowEmpty?: boolean;
  customInput?: Rendered<React.Component<InputProps>>;
  defaultValue?: string | number;
  disabled?: boolean;
  icon?: string;
  mask?: string;
  rowStyle?: React.CSSProperties;
  totalValueLength?: number;
  type?: 'text' | 'number';
} & IPromisedBaseProps<string | number>
  & Omit<InputProps, 'onChange' | 'value'>

export class PromisedInput extends PromisedBase<PromisedInputProps,
  IPromisedBaseState<string | number>,
  string | number> {
  public constructor(props: PromisedInputProps) {
    super(props);
    this.state = {
      ...this.state,
      savedValue: this.props.defaultValue,
      value: this.props.defaultValue,
    };
  }

  @autobind
  public maskValidator(mask: string, totalValueLength: number): ValidatorFunction<string | number> {
    return value => {
      const strValue = value as string;

      return ((strValue.length === totalValueLength) || (strValue.length === 0 && this.props.allowEmpty))
        ? ''
        : `Заполните поле по маске ${mask}`;
    }
  }

  public render(): JSX.Element {
    const input = this.props.customInput || <Input/>;

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
        {
          this.wrapInValidationPopover(
            this.props.mask
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
                React.cloneElement(input, {
                  ...this.props,
                  disabled: this.props.disabled || this.state.loading,
                  onChange: this.handleNewValue,
                  value: this.state.value,
                })
              )
          )
        }
        {saveButton && this.wrapConfirmAndError(saveButton)}
      </div>
    );
  }

  @autobind
  private handleNewValue(newValue: React.ChangeEvent<HTMLInputElement> | string): void {
    const value = typeof newValue === 'string' ? newValue : newValue.target.value;
    const validators = this.composeValidatorToAsyncValidatorRules(this.props.validator);
    if (this.props.mask) {
      validators.unshift(this.functionValidatorToFixedRuleItem(
        this.maskValidator(this.props.mask, this.props.totalValueLength)
      ));
    }
    // tslint:disable-next-line:no-floating-promises
    this.validate(validators, value);
    // tslint:disable-next-line:no-any
    if (this.props.type === 'number' && !((!Number.isNaN(value as any) && NUMBER_REGEX.test(value)) || value === '' || value === '-')) {
      return;
    }
    this.setState({value: this.props.type === 'number' ? (value ? (value === '-' ? '-' : Number(value)) : undefined) : value});
  }
}


