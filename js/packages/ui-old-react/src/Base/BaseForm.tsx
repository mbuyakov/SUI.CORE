/* eslint-disable */
import {IObjectWithIndex} from '@sui/ui-old-core';
import {Observable, ObservableHandlerStub} from "@/Observable";
import {BASE_FORM_CLASS} from "@/styles";
import {SUIReactComponent} from "@/SUIReactComponent";
import {hasErrors} from '@/utils';
import asyncValidator, {RuleItem} from 'async-validator';
import autobind from 'autobind-decorator';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import * as React from 'react';

import {BaseCard, IBaseCardProps} from './BaseCard';
import {BaseFormContext} from './BaseFormContext';
import {IBaseFormItemLayout, renderIBaseFormItemLayout} from './BaseFormItemLayout';

export type ValuesGetter = (fields: string[]) => IObjectWithIndex;

export interface IBaseFormChildrenProps {
  get?: ValuesGetter,
  hasErrors?: Observable<boolean>,
  isSaveInProgress?: boolean

  onClear?(): void;

  onSubmit?(): void;
}

export type BaseFormChildrenFn = React.FunctionComponent<IBaseFormChildrenProps>;

export type IBaseFormProps = Omit<IBaseCardProps<any, IBaseFormItemLayout>, 'item' | 'forceRenderTabs' | 'itemRenderer'> & {
  children?: BaseFormChildrenFn;
  childrenPosition?: "top" | "bottom" | "both";
  customFinalInputNodesProps?: IObjectWithIndex;
  customInputNodesProps?: IObjectWithIndex;
  initialValues?: IObjectWithIndex;
  uuid?: string;
  verticalLabel?: boolean;
  customFieldValues?(get: ValuesGetter): IObjectWithIndex;
  onInitialized?(form: BaseForm): void;
  onSubmit(fields: any): Promise<boolean>;
}

export interface IFormField {
  error: Observable<string | null>
  errorObservableHandlerStub: ObservableHandlerStub
  rules: RuleItem[]
  validatorId?: number
  value: Observable<any>
  valueObservableHandlerStub: ObservableHandlerStub
}

export class BaseForm extends SUIReactComponent<IBaseFormProps, {
  saving?: boolean
}> {
  private readonly customFieldValues: IObjectWithIndex = {};
  private readonly fieldErrors: IObjectWithIndex = {};
  private readonly formFields: Map<string, IFormField> = new Map();
  private readonly hasErrors: Observable<boolean> = new Observable<boolean>(false);
  private readonly headerFieldValues: IObjectWithIndex = {};

  private readonly subscribedCustomFieldValues: string[] = [];
  private readonly subscribedHeaderFieldValues: string[] = [];

  public constructor(props: IBaseFormProps) {
    super(props);
    this.state = {};
  }

  @autobind
  public clearForm(): void {
    Array.from(this.formFields.keys()).reduce((prev, cur) => {
      prev[cur] = null;

      return prev;
    }, {} as IObjectWithIndex);

    // I tak soidet
    this.componentWillUnmount();
    this.componentDidMount();
  }

  public componentDidMount(): void {
    this.customFieldValuesUpdater();

    if (this.props.onInitialized) {
      this.props.onInitialized(this);
    }

    // To disabled submit button at the beginning
    this.validateFields();
  }

  @autobind
  public getFieldError(field: string): string {
    const formField = this.formFields.get(field);

    return formField ? formField.error.getValue() : null;
  }

  @autobind
  public getFieldsError(): IObjectWithIndex {
    return Array.from(this.formFields.entries()).reduce((prev, cur) => {
      prev[cur[0]] = cur[1].error;

      return prev;
    }, {} as IObjectWithIndex);
  }

  @autobind
  public subscribeOnHasError(callback: (newValue: boolean, oldValue: boolean) => void, triggerOnSubscribe: boolean = false): void {
    this.registerObservableHandler(this.hasErrors.subscribe(callback, triggerOnSubscribe));
  }

  @autobind
  public getFieldsValue(): IObjectWithIndex {
    return Array.from(this.formFields.entries()).reduce((prev, cur) => {
      prev[cur[0]] = cur[1].value.getValue();

      return prev;
    }, {} as IObjectWithIndex);
  }

  @autobind
  public getFieldValue(field: string): any {
    const formField = this.formFields.get(field);

    return formField ? formField.value.getValue() : null;
  }

  @autobind
  public getFormField(field: string): IFormField {
    return this.formFields.get(field);
  }

  @autobind
  public getFormFields(): IFormField[] {
    return Array.from(this.formFields.values());
  }

  @autobind
  public getFormFieldsMap(): Map<string, IFormField> {
    return this.formFields;
  }

  @autobind
  public removeField(field: string): void {
    const formField = this.formFields.get(field);
    if (formField) {
      formField.error.setValue(null);
      formField.valueObservableHandlerStub.unsubscribe();
      formField.errorObservableHandlerStub.unsubscribe();
      this.formFields.delete(field);
    }
  }

  @autobind
  public getOrCreateFormField(field: string): IFormField {
    if (!this.formFields.has(field)) {
      const error = new Observable<string | null | undefined>();
      const errorObservableHandlerStub = error.subscribe(newError => {
        this.fieldErrors[field] = newError;
        this.__checkHasErrors();
      });

      const value = new Observable<any>();
      const valueObservableHandlerStub = value.subscribe(() => this.validateField(field));
      const newFormField: IFormField = {
        error,
        errorObservableHandlerStub,
        rules: [],
        value,
        valueObservableHandlerStub
      };

      this.formFields.set(field, newFormField);
    }

    return this.formFields.get(field);
  }

  @autobind
  public async onSubmit(): Promise<boolean> {
    if (!this.hasErrors.getValue()) {
      this.setState({saving: true});
      const answer = await this.props.onSubmit(this.getFieldsValue());
      if (answer) {
        this.clearForm();
      }
      this.setState({saving: false});

      return answer;
    }

    return false;
  }

  public render(): React.ReactNode {
    const {onSubmit, childrenPosition, ...rest} = this.props;

    const showChildrenOnTop = !childrenPosition || childrenPosition === "top" || childrenPosition === "both";
    const showChildrenOnBottom = childrenPosition === "bottom" || childrenPosition === "both";
    const children = this.props.children && this.props.children({
      get: this.headerWrapperValuesGetter,
      hasErrors: this.hasErrors,
      isSaveInProgress: this.state.saving,
      onClear: this.clearForm,
      onSubmit: this.onSubmit
    });

    return (
      <BaseFormContext.Provider
        value={{
          baseForm: this,
          customFinalInputNodesProps: this.props.customFinalInputNodesProps,
          customInputNodesProps: this.props.customInputNodesProps,
          initialValues: this.props.initialValues,
          verticalLabel: !!this.props.verticalLabel
        }}
      >
        {showChildrenOnTop && children}
        <FormBodyWrapper>
          <BaseCard
            forceRenderTabs={true}
            itemRenderer={renderIBaseFormItemLayout}
            {...rest}
            className={classNames(BASE_FORM_CLASS, this.props.className)}
          />
        </FormBodyWrapper>
        {showChildrenOnBottom && children}
      </BaseFormContext.Provider>
    );
  }

  @autobind
  public setFieldError(field: string, error: string): void {
    this.formFields.get(field).error.setValue(error)
  }

  @autobind
  public setFieldsValues(values: IObjectWithIndex): void {
    Object.keys(values).forEach(key => this.setFieldValue(key, values[key]));
  }

  @autobind
  public setFieldValue(field: string, value: any): void {
    const formField = this.getOrCreateFormField(field);
    if (formField.value.getValue() !== value) {
      formField.value.setValue(value);
    }
  }

  @autobind
  public async validateField(field: string): Promise<void> {
    const formField = this.formFields.get(field);

    if (formField.rules.length === 0) {
      formField.error.setValue(null);

      return;
    }

    const validator = new asyncValidator({
      [field]: formField.rules
    });

    const timestamp: number = (new Date()).getTime();
    formField.validatorId = timestamp;

    return validator.validate({
      [field]: formField.value.getValue()
    }, {first: true}, errors => {
      if (formField.validatorId === timestamp) {
        let error = null;

        if (errors && errors.length > 0) {
          error = errors[0].message;
        }
        formField.error.setValue(error);
      }
    }).catch(() => {/* Используем коллбек, так что пофиг (наверное). Catch нужен, так как без него браузер слегка подлагивает*/
    });
  }

  @autobind
  public async validateFields(): Promise<void[]> {
    return Promise.all(Array.from(this.formFields.keys()).map(field => this.validateField(field)));
  }

  // @autobind
  // public addFieldValueObserver(field: string, cb: ObservableHandler<any>): ObservableHandlerStub {
  //   return this.getOrCreateFormField(field).value.subscribe(cb);
  // }

  @autobind
  private __checkHasErrors(): void {
    const prevHasErrors = this.hasErrors.getValue();
    const curHasErrors = hasErrors(this.fieldErrors);
    if (prevHasErrors !== curHasErrors) {
      this.hasErrors.setValue(curHasErrors);
    }
  }

  @autobind
  private customFieldValuesGetter(fields: string[]): IObjectWithIndex {
    return fields.reduce((obj, field) => {
      if (this.subscribedCustomFieldValues.includes(field)) {
        obj[field] = this.customFieldValues[field];
      } else {
        const formField = this.getOrCreateFormField(field);
        this.registerObservableHandler(formField.value.subscribe(newValue => {
          this.customFieldValues[field] = newValue;
          this.customFieldValuesUpdater();
        }));
        this.subscribedCustomFieldValues.push(field);
        const value = formField.value.getValue();
        this.customFieldValues[field] = value;

        obj[field] = value;
      }

      return obj;
    }, {} as IObjectWithIndex);
  }

  @autobind
  private customFieldValuesUpdater(): void {
    if (this.props.customFieldValues) {
      const oldValue = this.customFieldValues;
      const newValue = this.props.customFieldValues(this.customFieldValuesGetter);
      const changedValue: IObjectWithIndex = {};
      Object.keys(newValue).forEach(key => {
        if (!isEqual(oldValue[key], newValue[key])) {
          changedValue[key] = newValue[key];
        }
      });
      if (Object.keys(changedValue).length > 0) {
        this.setFieldsValues(changedValue);
      }
    }
  }

  @autobind
  private headerWrapperValuesGetter(fields: string[]): IObjectWithIndex {
    return fields.reduce((obj, field) => {
      if (this.subscribedHeaderFieldValues.includes(field)) {
        obj[field] = this.headerFieldValues[field];
      } else {
        const formField = this.getOrCreateFormField(field);
        this.registerObservableHandler(formField.value.subscribe(newValue => {
          this.headerFieldValues[field] = newValue;
          this.forceUpdate();
        }));
        this.subscribedHeaderFieldValues.push(field);
        const value = formField.value.getValue();
        this.headerFieldValues[field] = value;

        obj[field] = value;
      }

      return obj;
    }, {} as IObjectWithIndex);
  }

}

class FormBodyWrapper extends React.Component<{
  children: React.ReactNode
}> {

  public render(): React.ReactNode {
    return this.props.children;
  }

  public shouldComponentUpdate(): boolean {
    return false;
  }

}