import {Popconfirm, Popover} from 'antd';
import {PopconfirmProps} from 'antd/lib/popconfirm';
import asyncValidator from "async-validator";
import autobind from 'autobind-decorator';
import * as React from 'react';

import {FixedRuleItem} from "../Base";

import {IPromisedErrorPopoverProps, PromisedErrorPopover} from './PromisedErrorPopover';

export type ValidatorFunction<V> = (value: V) => string | void;
export type ComposeValidator<V> = ValidatorFunction<V> | FixedRuleItem[] | null;

export interface IPromisedBaseProps<V> {
  defaultValue?: V;
  errorPopoverProps?: Omit<IPromisedErrorPopoverProps, "promise">;
  popconfirmSettings?: PopconfirmSettings | boolean;
  validator?: ComposeValidator<V>;

  // Must be function to generate new promise on each change
  promise(value: V): Promise<void>;
}

export interface IPromisedBaseState<V> {
  loading?: boolean;
  popconfirmVisible?: boolean;
  promise?: Promise<void>;
  savedValue?: V;
  validatorText?: string | React.ReactNode;
  value?: V;
}

type PopconfirmSettings = Omit<PopconfirmProps, 'onConfirm' | 'onCancel'>;

export abstract class PromisedBase<P, S extends IPromisedBaseState<V>, V> extends React.Component<IPromisedBaseProps<V> & P, S> {
  private validatorId: number = 0;

  public constructor(props: IPromisedBaseProps<V> & P) {
    super(props);
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    this.state = {
      validatorText: ''
    };
  }

  public componentDidMount(): void {
    // tslint:disable-next-line:no-floating-promises
    this.validate(this.props.defaultValue);
  }

  @autobind
  public save(value?: V): void {
    if (this.state.loading) {
      return;
    }

    if (this.props.popconfirmSettings) {
      // tslint:disable-next-line:strict-type-predicates
      this.setState({popconfirmVisible: true, value: (value == null ? this.state.value : value)});
    } else {
      this.onConfirm(value);
    }
  }

  @autobind
  public saveWithoutValue(): void {
    // Workaround for button handler
    this.save();
  }

  @autobind
  public async validate(value: V): Promise<void> {
    const rules = this.composeValidatorToAsyncValidatorRules(this.getValidator());
    if (rules === null || (Array.isArray(rules) && rules.length === 0)) {
      this.setState({validatorText: ""});

      return;
    }

    const validator = new asyncValidator({"value": rules});
    const timestamp: number = (new Date()).getTime();
    this.validatorId = timestamp;
    const options = {first: false};

    return validator.validate({value}, options, errors => {
      const notEmptyErrors = errors.filter( e => Boolean(e.message));
      const validatorResult = notEmptyErrors && notEmptyErrors.length > 0
        ? notEmptyErrors[0].message  //errors.map(error => error.message).join(", ")
        : '';
      if (this.validatorId === timestamp) {
        this.setState({validatorText: validatorResult});
      }
    }).catch(() => {/* Используем коллбек, так что пофиг (наверное). Catch нужен, так как без него браузер слегка подлагивает*/
    });
  }

  protected composeValidatorToAsyncValidatorRules(validator: ComposeValidator<V>): FixedRuleItem[] | null {
    if (!validator) {
      return null;
    }
    if (Array.isArray(validator)) {
      return validator.filter(Boolean);
    }

    return [this.functionValidatorToFixedRuleItem(validator)];
  }

  protected functionValidatorToFixedRuleItem(validator: ValidatorFunction<V>): FixedRuleItem {
    return {
      "validator": (_, value, cb) => {
        const validationMsg = validator(value);

        return cb(validationMsg ? validationMsg : '');
      }
    };
  }

  @autobind
  protected getValidator(): ComposeValidator<V> {
    return this.props.validator;
  }


  @autobind
  protected isValidatorTextEmpty(): boolean {
    const value = this.state.validatorText;

    return value === null
      || value === undefined
      || (typeof value === 'string' && value.length === 0);
  }

  @autobind
  protected onCancel(): void {
    this.setState({popconfirmVisible: false});
  }

  @autobind
  protected onChange(value: V): void {
    this.setState({value});
    // tslint:disable-next-line:no-floating-promises
    this.validate(value);
  }

  protected wrapConfirmAndError(child: JSX.Element | null): JSX.Element {
    const childWithErrorPopover = <PromisedErrorPopover {...this.props.errorPopoverProps} promise={this.state.promise}>{child}</PromisedErrorPopover>;

    return this.props.popconfirmSettings ? (
      <Popconfirm
        {...(typeof this.props.popconfirmSettings === 'boolean' ? {title: 'Вы уверены?'} : (this.props.popconfirmSettings as PopconfirmSettings))}
        visible={this.state.popconfirmVisible}
        onConfirm={this.onConfirmWithoutValue}
        onCancel={this.onCancel}
      >
        {childWithErrorPopover}
      </Popconfirm>
    ) : (
      childWithErrorPopover
    );
  }

  protected wrapInValidationPopover(child: JSX.Element | null): JSX.Element {
    console.debug("wrapInValidationPopover", this.getValidator());

    return this.getValidator()
      ? (
        <Popover
          trigger="click"
          visible={!this.isValidatorTextEmpty()}
          content={this.state.validatorText}
        >
          {child}
        </Popover>
      )
      : (child);
  }

  @autobind
  private onConfirm(value?: V): void {
    // tslint:disable-next-line:triple-equals
    const promise = this.props
      .promise(value == null ? this.state.value : value)
      .then(_ => {
        // tslint:disable-next-line:triple-equals
        this.setState({loading: false, savedValue: (value == null ? this.state.value : value)});
      })
      .catch(reason => {
        this.setState({loading: false});
        throw reason;
      });
    this.setState({promise, loading: true, popconfirmVisible: false});
  }

  @autobind
  private onConfirmWithoutValue(): void {
    // Workaround for button handler
    this.onConfirm();
  }
}

