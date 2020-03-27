/* tslint:disable:no-any */
import asyncValidator, { RuleItem } from 'async-validator';
import autobind from 'autobind-decorator';
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import moment from 'moment';
import * as React from 'react';

import { errorNotification } from '../drawUtils';
import { Observable } from '../Observable';
import { IObjectWithIndex } from '../other';
import { BASE_FORM_CLASS } from '../styles';
import { SUIReactComponent } from '../SUIReactComponent';

import {BaseCard, IBaseCardProps} from './BaseCard';
import {BaseFormContext} from './BaseFormContext';
import { IBaseFormItemLayout, renderIBaseFormItemLayout } from './BaseFormItemLayout';

export type ValuesGetter = (fields: string[]) => IObjectWithIndex;


export const SUBMITTED_FIELD = '___SUBMITTED___';
export const FORM_LOCALSTORAGE_KEY = '__SUI_FORM_';

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
  customFinalInputNodesProps?: IObjectWithIndex;
  customInputNodesProps?: IObjectWithIndex;
  // tslint:disable-next-line:no-any
  initialValues?: IObjectWithIndex;
  uuid: string;
  verticalLabel?: boolean;
  // tslint:disable-next-line:no-any
  customFieldValues?(get: ValuesGetter): IObjectWithIndex;
  onInitialized?(form: BaseForm): void;
  // tslint:disable-next-line:no-any
  onSubmit(fields: any): Promise<boolean>;
}

export interface IFormField {
  error: Observable<string | null>
  rules: RuleItem[]
  validatorId?: number
  value: Observable<any>
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
    localStorage.removeItem(`${FORM_LOCALSTORAGE_KEY}${this.props.uuid}`);
    Array.from(this.formFields.keys()).reduce((prev, cur) => {
      prev[cur] = null;

      return prev;
    }, {} as IObjectWithIndex);

    // I tak soidet
    this.componentWillUnmount();
    this.componentDidMount();
  }

  public componentDidMount(): void {
    let formParsedValue;
    if (this.props.initialValues) {
      formParsedValue = this.props.initialValues;
    }
    const formValue = localStorage.getItem(`${FORM_LOCALSTORAGE_KEY}${this.props.uuid}`);
    if (formParsedValue || formValue) {
      try {
        if (!formParsedValue) {
          formParsedValue = JSON.parse(formValue);
        }
        this.setFieldsValuesFromRaw(formParsedValue);
      } catch (e) {
        errorNotification('Ошибка при попытке загрузки заполненной формы', e.stack ? e.stack.toString() : e.toString());
        console.error(e);
        console.log(formValue);
        localStorage.removeItem(`${FORM_LOCALSTORAGE_KEY}${this.props.uuid}`);
        console.log('Saved value cleared');
      }
    }

    this.customFieldValuesUpdater();

    if (this.props.onInitialized) {
      this.props.onInitialized(this);
    }

    // To disabled submit button at the beginning
    // tslint:disable-next-line:no-floating-promises
    this.validateFields();
  }

  // tslint:disable-next-line:no-any
  public componentDidUpdate(prevProps: IBaseFormProps): void {
    // Very strange use-case
    if (!isEqual(prevProps.initialValues, this.props.initialValues) && this.props.initialValues) {
      this.setFieldsValues(this.props.initialValues);
    }
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
  public getOrCreateFormField(field: string): IFormField {
    if (!this.formFields.has(field)) {
      const newFormField: IFormField = {
        error: new Observable<string | null | undefined>(),
        rules: [],
        value: new Observable<any>(),
      };

      newFormField.value.subscribe(() => this.validateField(field));
      newFormField.error.subscribe(newError => {
        this.fieldErrors[field] = newError;
        this.__checkHasErrors();
      });
      this.formFields.set(field, newFormField);
    }

    return this.formFields.get(field);
  }

  @autobind
  public isFieldsTouched(fields?: string[]): boolean {
    // tslint:disable-next-line:triple-equals
    if (fields == null) {
      // tslint:disable-next-line:no-parameter-reassignment
      fields = Array.from(this.formFields.keys());
    }

    return fields.some(field => this.isFieldTouched(field));
  }

  @autobind
  public isFieldTouched(field: string): boolean {
    // Stub. Is it really needed?
    return true;
  }

  @autobind
  public async onSubmit(): Promise<boolean> {
    this.setFieldValue(SUBMITTED_FIELD, true);

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
    const {onSubmit, ...rest} = this.props;

    return (
      <BaseFormContext.Provider
        value={{
          baseForm: this,
          customFinalInputNodesProps: this.props.customFinalInputNodesProps,
          customInputNodesProps: this.props.customInputNodesProps,
          verticalLabel: !!this.props.verticalLabel,
        }}
      >
        {this.props.children && this.props.children({
          get: this.headerWrapperValuesGetter,
          hasErrors: this.hasErrors,
          isSaveInProgress: this.state.saving,
          onClear: this.clearForm,
          onSubmit: this.onSubmit
        })}
        <FormBodyWrapper>
          <BaseCard
            forceRenderTabs={true}
            itemRenderer={renderIBaseFormItemLayout}
            className={classNames(BASE_FORM_CLASS, this.props.className)}
            {...rest}
          />
        </FormBodyWrapper>
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
    this.getOrCreateFormField(field).value.setValue(value);
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
      if (formField.validatorId === timestamp ) {
        let error = null;

        if (errors && errors.length > 0) {
          error = errors[0].message;
        }
        formField.error.setValue(error);
      }
    }).catch(() => {/* Используем коллбек, так что пофиг (наверное). Catch нужен, так как без него браузер слегка подлагивает*/});
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
    const hasErrors = Object.keys(this.fieldErrors).some(key => !!this.fieldErrors[key]);
    if(prevHasErrors !== hasErrors) {
      this.hasErrors.setValue(hasErrors);
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

  @autobind
  private setFieldsValuesFromRaw(values: IObjectWithIndex): void {
    const parsedValues = Object.keys(values).reduce((prev, curKey) => {
      let fieldValue = values[curKey];

      // Magic
      // tslint:disable-next-line:no-magic-numbers
      if (typeof fieldValue === 'string' && ((fieldValue.match(/-/g) || []).length >= 2 || fieldValue.includes('.'))) {
        const momentValue = moment(fieldValue);
        if (momentValue.isValid()) {
          // noinspection JSUnfilteredForInLoop
          fieldValue = momentValue;
        }
      }

      prev[curKey] = fieldValue;

      return prev;
    }, {} as IObjectWithIndex);

    this.setFieldsValues(parsedValues);
  }
}

// tslint:disable-next-line:max-classes-per-file
class FormBodyWrapper extends React.Component {

  public render(): React.ReactNode {
    return this.props.children;
  }

  public shouldComponentUpdate(): boolean {
    return false;
  }
}
