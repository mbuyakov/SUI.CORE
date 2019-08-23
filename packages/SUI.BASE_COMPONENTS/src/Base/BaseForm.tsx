import {errorNotification, IObjectWithIndex, Omit, OneOrArrayWithNulls} from '@smsoft/sui-core';
import Form, {WrappedFormInternalProps} from 'antd/lib/form/Form';
import autobind from 'autobind-decorator';
import isEqual from "lodash/isEqual";
import moment from 'moment';
import * as React from 'react';

import {BaseCard, IBaseCardProps} from './BaseCard';
import {IBaseFormRowLayout} from './BaseCardRowLayout';
import {BaseFormContext} from './BaseFormContext';
// import Timeout = NodeJS.Timeout;

export const SUBMITTED_FIELD = "___SUBMITTED___";
export const FORM_LOCALSTORAGE_KEY = "__SUI_FORM_";

export type BaseFormChildrenFn = (table: JSX.Element, onClear: () => void, onSubmit: () => void, hasErrors: boolean, formValues: IObjectWithIndex, isSaveInProgress: boolean) => JSX.Element;
// tslint:disable-next-line:no-any
export type SaveFormFn = (values: IObjectWithIndex) => any;

export type IBaseFormProps<T> = Omit<IBaseCardProps<T>, 'item' | 'rows' | 'forceRenderTabs'> & {
  children: BaseFormChildrenFn
  // tslint:disable-next-line:no-any
  initialValues?: IObjectWithIndex
  periodFormSave?: number
  rows: OneOrArrayWithNulls<IBaseFormRowLayout<T>>
  saveActivityFunction?: SaveFormFn
  uuid: string
  verticalLabel?: boolean
  // tslint:disable-next-line:no-any
  customFieldValues?(currentValues: IObjectWithIndex): IObjectWithIndex
  // tslint:disable-next-line:no-any
  onSubmit(fields: any): Promise<boolean>
}

function hasErrors(fieldsError: Record<string, string[] | undefined>): boolean {
  return Object.keys(fieldsError).some(field => !!fieldsError[field]);
}

class BaseFormInner<T> extends React.Component<IBaseFormProps<T> & WrappedFormInternalProps, {
  saving?: boolean
}> {
  // tslint:disable-next-line:no-any
  private intervalHandler: any;
  private lastFormValues: IObjectWithIndex = {};

  public constructor(props: IBaseFormProps<T> & WrappedFormInternalProps) {
    super(props);
    this.state = {};
  }

  @autobind
  public clearForm(): void {
    localStorage.removeItem(`${FORM_LOCALSTORAGE_KEY}${this.props.uuid}`);
    this.props.form.resetFields();
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
          formParsedValue = JSON.parse(formValue as string);
        }
        this.setFieldsValues(formParsedValue);
      } catch (e) {
        errorNotification("Ошибка при попытке загрузки заполненной формы", e.stack ? e.stack.toString() : e.toString());
        console.error(e);
        console.log(formValue);
        localStorage.removeItem(`${FORM_LOCALSTORAGE_KEY}${this.props.uuid}`);
        console.log("Saved value cleared");
      }
    }
    // To disabled submit button at the beginning
    this.props.form.validateFields();
    this.intervalHandler = setInterval(() => !!this.props.periodFormSave && !!this.props.saveActivityFunction && this.props.saveActivityFunction(this.lastFormValues)
    , this.props.periodFormSave);
  }

  // tslint:disable-next-line:no-any
  public componentDidUpdate(prevProps: IBaseFormProps<any>): void {
    if (!isEqual(prevProps.initialValues, this.props.initialValues) && this.props.initialValues) {
      this.setFieldsValues(this.props.initialValues);
    }
  }

  public componentWillUnmount(): void {
    clearInterval(this.intervalHandler);
  }


  public render(): React.ReactNode {
    const {form, onSubmit, ...rest} = this.props;

    const formValues = this.props.form.getFieldsValue();
    this.lastFormValues = formValues;

    if (this.props.customFieldValues) {
      const oldValue = formValues;
      const newValue = this.props.customFieldValues(oldValue);
      const changedValue:IObjectWithIndex = {};
      Object.keys(newValue).forEach(key => {
        if (!isEqual(oldValue[key], newValue[key])) {
          changedValue[key] = newValue[key];
        }
      });
      if (Object.keys(changedValue).length > 0) {
        this.props.form.setFieldsValue(changedValue);
      }
    }

    const errors = hasErrors(form.getFieldsError());
    const table = (
      <BaseCard
        forceRenderTabs={true}
        {...rest}
      />
    );

    return (
      <BaseFormContext.Provider value={{form, formValues, verticalLabel: !!this.props.verticalLabel}}>
        {this.props.children(table, this.clearForm, this.onClick, errors, formValues, this.state.saving as boolean)}
        {this.props.form.getFieldDecorator(SUBMITTED_FIELD)(<div style={{display: "none"}}/>)}
      </BaseFormContext.Provider>
    );
  }


  @autobind
  private async onClick(): Promise<void> {
    const fields: IObjectWithIndex = {};
    fields[SUBMITTED_FIELD] = true;
    this.props.form.setFieldsValue(fields);

    if (!hasErrors(this.props.form.getFieldsError())) {
      this.setState({saving: true});
      const answer = await this.props.onSubmit(this.props.form.getFieldsValue());
      if (answer) {
        this.clearForm();
      }
      this.setState({saving: false});
    }
  }

  @autobind
  // tslint:disable-next-line:no-any
  private setFieldsValues(values: IObjectWithIndex): void {
    // tslint:disable-next-line:forin
    for (const field in values) {
      // noinspection JSUnfilteredForInLoop
      const fieldValue = values[field];

      // Magic
      if (typeof fieldValue === "string" && (fieldValue.includes("-") || fieldValue.includes("."))) {
        const momentValue = moment(fieldValue);
        if (momentValue.isValid()) {
          // noinspection JSUnfilteredForInLoop
          values[field] = momentValue;
        }
      }
    }
    this.props.form.setFieldsValue(values);
  }
}

// tslint:disable-next-line:no-any variable-name
export let BaseForm = Form.create()(BaseFormInner) as any as React.ComponentClass<IBaseFormProps<any>>;
