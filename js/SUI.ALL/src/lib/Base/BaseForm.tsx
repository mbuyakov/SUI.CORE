/* tslint:disable:no-any member-ordering */
import asyncValidator, { RuleItem } from 'async-validator';
import autobind from 'autobind-decorator';
import isEqual from 'lodash/isEqual';
import moment, { Moment } from 'moment';
import * as React from 'react';

import { errorNotification } from '../drawUtils';
import { Observable } from '../Observable';
import { IObjectWithIndex, IPartialObjectWithIndex } from '../other';
import { SUIReactComponent } from '../SUIReactComponent';
import { OneOrArrayWithNulls } from '../typeWrappers';

import {BaseCard, IBaseCardProps} from './BaseCard';
import {IBaseFormRowLayout} from './BaseCardRowLayout';
import {BaseFormContext} from './BaseFormContext';

export type ValuesGetter<FIELDS extends string = string> = (fields: FIELDS[]) => IPartialObjectWithIndex<FIELDS>;


export type IBaseFormProps<FIELDS extends string> = Omit<IBaseCardProps<any>, 'item' | 'rows' | 'forceRenderTabs'> & {
  customInputNodesTags?: IObjectWithIndex
  // tslint:disable-next-line:no-any
  initialValues?: IPartialObjectWithIndex<FIELDS>
  rows: OneOrArrayWithNulls<IBaseFormRowLayout<FIELDS>>
  verticalLabel?: boolean
  // tslint:disable-next-line:no-any
  customFieldValues?(get: ValuesGetter<FIELDS>): IPartialObjectWithIndex<FIELDS>
}

export interface IFormField<NAME extends string = string> {
  name: NAME
  error: Observable<string | null>
  rules: RuleItem[]
  value: Observable<any>
}

export class BaseForm<FIELDS extends string = string> extends SUIReactComponent<IBaseFormProps<FIELDS>> {
  private readonly customFieldValues: IPartialObjectWithIndex<FIELDS> = {};
  private readonly fieldErrors: IPartialObjectWithIndex<FIELDS, string> = {};
  private readonly formFields: Map<FIELDS, IFormField<FIELDS>> = new Map();
  private readonly hasErrors: Observable<boolean> = new Observable<boolean>(false);
  private readonly externalFieldValues: IPartialObjectWithIndex<FIELDS> = {};

  private readonly subscribedCustomFieldValues: FIELDS[] = [];
  private readonly subscribedExternalFieldValues: FIELDS[] = [];

  //<editor-fold desc="React lifecycle">
  public componentDidMount(): void {
    this.customFieldValuesUpdater();

    let formParsedValue;
    if (this.props.initialValues) {
      formParsedValue = this.props.initialValues;
    }
    if (formParsedValue) {
      try {
        this.setFieldsValuesFromRaw(formParsedValue);
      } catch (e) {
        errorNotification('Ошибка при попытке загрузки заполненной формы', e.stack ? e.stack.toString() : e.toString());
        console.error(e);
      }
    }

    // To disabled submit button at the beginning
    // tslint:disable-next-line:no-floating-promises
    this.validateFields();
  }

  public componentDidUpdate(prevProps: IBaseFormProps<FIELDS>): void {
    // Very strange use-case
    if (!isEqual(prevProps.initialValues, this.props.initialValues) && this.props.initialValues) {
      this.setFieldsValues(this.props.initialValues);
    }
  }

  public render(): React.ReactNode {
    const {...rest} = this.props;

    return (
      <BaseFormContext.Provider
        value={{
          baseForm: this as unknown as BaseForm,
          customInputNodesTags: this.props.customInputNodesTags,
          verticalLabel: !!this.props.verticalLabel,
        }}
      >
        <FormBodyWrapper>
          <BaseCard
            forceRenderTabs={true}
            {...rest}
          />
        </FormBodyWrapper>
      </BaseFormContext.Provider>
    );
  }
  //</editor-fold>

  //<editor-fold desc="FormField">
  @autobind
  public getOrCreateFormField(field: FIELDS): IFormField<FIELDS> {
    if (!this.formFields.has(field)) {
      const newFormField: IFormField<FIELDS> = {
        error: new Observable<string | null | undefined>(),
        name: field,
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
  public getFormField(field: FIELDS): IFormField<FIELDS> {
    return this.formFields.get(field);
  }

  @autobind
  public getFormFields(fields?: FIELDS[]): Array<IFormField<FIELDS>> {
    if(!fields) {
      // tslint:disable-next-line:no-parameter-reassignment
      fields = Array.from(this.formFields.keys());
    }

    return fields.map(field => this.formFields.get(field));
  }
  //</editor-fold>

  //<editor-fold desc="Value">
  @autobind
  public getFieldValue(field: FIELDS): any {
    return this.getFormField(field).value.getValue();
  }

  @autobind
  public getFieldsValue(fields?: FIELDS[]): IPartialObjectWithIndex<FIELDS> {
    return this.getFormFields(fields).reduce((prev, cur) => {
      prev[cur.name] = cur.value.getValue();

      return prev;
    }, {} as IPartialObjectWithIndex<FIELDS>);
  }

  @autobind
  public setFieldValue(field: FIELDS, value: any): void {
    this.getOrCreateFormField(field).value.setValue(value);
  }

  @autobind
  public setFieldsValues(values: IPartialObjectWithIndex<FIELDS>): void {
    (Object.keys(values) as FIELDS[]).forEach(key => this.setFieldValue(key, values[key]));
  }
  //</editor-fold>

  //<editor-fold desc="Error">
  @autobind
  public getFieldError(field: FIELDS): string {
    return this.getFormField(field).value.getValue();
  }

  @autobind
  public getFieldsErrors(fields?: FIELDS[]): IPartialObjectWithIndex<FIELDS, string> {
    return this.getFormFields(fields).reduce((prev, cur) => {
      prev[cur.name] = cur.error.getValue();

      return prev;
    }, {} as IPartialObjectWithIndex<FIELDS, string>);
  }

  @autobind
  public setFieldError(field: FIELDS, error: string): void {
    this.getFormField(field).error.setValue(error)
  }

  @autobind
  public setFieldsErrors(errors: IPartialObjectWithIndex<FIELDS, string>): void {
    (Object.keys(errors) as FIELDS[]).forEach((key) => this.setFieldError(key, errors[key]));
  }
  //</editor-fold>

  //<editor-fold desc="Validate">
  @autobind
  public async validateField(field: FIELDS): Promise<void> {
    const formField = this.getFormField(field);
    const validator = new asyncValidator({
      [field]: formField.rules
    });

    return validator.validate({
      [field]: formField.value.getValue()
    }, {}, errors => {
      let error = null;

      if (errors && errors.length > 0) {
        error = errors[0].message;
      }

      formField.error.setValue(error);
    }).catch(() => {/* Используем коллбек, так что пофиг (наверное). Catch нужен, так как без него браузер слегка подлагивает*/});
  }

  @autobind
  public async validateFields(): Promise<void[]> {
    return Promise.all(Array.from(this.formFields.keys()).map(field => this.validateField(field)));
  }
  //</editor-fold>

  @autobind
  private __checkHasErrors(): void {
    const prevHasErrors = this.hasErrors.getValue();
    const hasErrors = (Object.keys(this.fieldErrors) as FIELDS[]).some(key => !!this.fieldErrors[key]);
    if(prevHasErrors !== hasErrors) {
      this.hasErrors.setValue(hasErrors);
    }
  }

  @autobind
  private customFieldValuesGetter(fields: FIELDS[]): IPartialObjectWithIndex<FIELDS> {
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
    }, {} as IPartialObjectWithIndex<FIELDS>);
  }

  @autobind
  private customFieldValuesUpdater(): void {
    if (this.props.customFieldValues) {
      const oldValue = this.customFieldValues;
      const newValue = this.props.customFieldValues(this.customFieldValuesGetter);
      const changedValue: IPartialObjectWithIndex<FIELDS> = {};
      (Object.keys(newValue) as FIELDS[]).forEach(key => {
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
  public externalValuesGetter(fields: FIELDS[]): IPartialObjectWithIndex<FIELDS> {
    return fields.reduce((obj, field) => {
      if (this.subscribedExternalFieldValues.includes(field)) {
        obj[field] = this.externalFieldValues[field];
      } else {
        const formField = this.getOrCreateFormField(field);
        this.registerObservableHandler(formField.value.subscribe(newValue => {
          this.externalFieldValues[field] = newValue;
          this.forceUpdate();
        }));
        this.subscribedExternalFieldValues.push(field);
        const value = formField.value.getValue();
        this.externalFieldValues[field] = value;

        obj[field] = value;
      }

      return obj;
    }, {} as IPartialObjectWithIndex<FIELDS>);
  }

  @autobind
  private setFieldsValuesFromRaw(values: IPartialObjectWithIndex<FIELDS, string>): void {
    const parsedValues = (Object.keys(values) as FIELDS[]).reduce((prev, curKey) => {
      let fieldValue: any = values[curKey];

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
    }, {} as IPartialObjectWithIndex<FIELDS>);

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
