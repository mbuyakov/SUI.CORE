import Button from 'antd/lib/button';
import Input, {InputProps} from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import autobind from 'autobind-decorator';
import * as React from 'react';

import {Rendered} from "../other";
import {trimIfString} from '../stringFormatters';
import {SUI_ROW_GROW_LEFT} from '../styles';
import {SUIMaskedInput} from '../SUIMaskedInput';

import {ComposeValidator, IPromisedBaseProps, IPromisedBaseState, PromisedBase, ValidatorFunction} from './PromisedBase';

const NUMBER_REGEX: RegExp = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;

export type PromisedInputProps<V> = {
  allowEmpty?: boolean;
  customInput?: Rendered<React.Component<InputProps>>;
  disabled?: boolean;
  icon?: string;
  mask?: string;
  rowStyle?: React.CSSProperties;
  totalValueLength?: number;
  type?: 'text' | 'number';
} & IPromisedBaseProps<V>
  & Omit<InputProps, 'onChange' | 'value'>

export class PromisedInput<V = string | number> extends PromisedBase<PromisedInputProps<V>,
  IPromisedBaseState<V>, V> {

  public constructor(props: PromisedInputProps<V>) {
    super(props);
    this.state = {
      ...this.state,
      savedValue: this.props.defaultValue,
      value: this.props.defaultValue,
    };
  }

  @autobind
  public maskValidator(mask: string, totalValueLength: number): ValidatorFunction<V> {
    return value => {
      const strValue = value.toString();

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
        disabled={this.state.loading || isEmptyAndEmptyNotAllowed || !this.isValidatorTextEmpty()}
        onClick={this.saveWithoutValue}
      />
    );
    saveButton = (this.state.savedValue !== this.state.value
      && (this.props.type === 'number' ? this.state.value as unknown !== '-' : true)
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
                  value={this.state.value as unknown as string}
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
  protected getValidator(): ComposeValidator<V> {
    let validators = this.composeValidatorToAsyncValidatorRules(super.getValidator());
    if (this.props.mask) {
      if (validators == null) {
        validators = [];
      }
      validators.unshift(this.functionValidatorToFixedRuleItem(
        this.maskValidator(this.props.mask, this.props.totalValueLength)
      ));
    }

    return validators;
  }

  @autobind
  private handleNewValue(newValue: React.ChangeEvent<HTMLInputElement> | string): void {
    const value = typeof newValue === 'string' ? newValue : newValue.target.value;
    // tslint:disable-next-line:no-floating-promises
    this.validate(value as unknown as V);
    // tslint:disable-next-line:no-any
    if (this.props.type === 'number' && !((!Number.isNaN(value as any) && NUMBER_REGEX.test(value)) || value === '' || value === '-')) {
      return;
    }
    this.setState({value: this.props.type === 'number' ? (value ? (value === '-' ? '-' : Number(value)) : undefined) : value} as unknown as V);
  }

}


