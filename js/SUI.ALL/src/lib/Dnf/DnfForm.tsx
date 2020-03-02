import { Form, Icon as LegacyIcon } from '@ant-design/compatible';
// tslint:disable-next-line:no-import-side-effect
import '@ant-design/compatible/assets/index.css';
import { FormComponentProps } from '@ant-design/compatible/lib/form';
import { Button, Card, Divider } from "antd";
import autobind from "autobind-decorator";
import isEqual from "lodash/isEqual";
import * as React from "react";

import { FormCreateKostyl, IObjectWithIndex } from '../other';
import {DNF_BUTTON} from "../styles";

import {AndFormRowElement, formItemLayoutWithOutLabel} from "./AndFormRowElement";
import {IClearDnfFromValues, ICommonDnfProps, IResultDnfFormValues} from "./ICommonDnfProps";


const formItemLayout = {
  style: {marginBottom: 0},
  wrapperCol: {
    sm: {span: 24},
    xs: {span: 24},
  }
};
const excludeFromValues = ["forms", "elements", "formValidator"];
const divider = (<Divider style={{marginTop: 4, marginBottom: 2}} />);
const orDivider = (<div style={{display: 'flex', justifyContent: 'center', fontSize: 'large'}}>ИЛИ</div>);

interface IDnfFromValues<TElements> extends IClearDnfFromValues {
  elements: TElements[];
  forms: number[][];
  formValidator: undefined[];
}

interface IDnfFormProps<T, V = IResultDnfFormValues<T>> {
  addDisjunctionButtonTitle?: string;
  andCardStyle?: React.CSSProperties;
  initialState?: IResultDnfFormValues<T>;
  orBehaviorDisabled?: boolean;

  // tslint:disable-next-line:no-any
  orElementValidator?(value: T[] | undefined, callback: any): void;
  valuesMapper?(values: IResultDnfFormValues<T>): V;
}

class InnerDnfForm<TElement, TValues> extends React.Component<FormComponentProps & ICommonDnfProps<TValues> & IDnfFormProps<TElement, TValues>, {
  initialElements?: TElement[];
  initialForms?: number[][];
  lastFormValues?: IDnfFromValues<TElement>;
}> {

  private static formatDnfFormValues<T>(values: IDnfFromValues<T>): T[][] {
    const {forms, elements} = values;

    return forms
      .map(form => (form || [])
        .map(element => elements && elements[element] || undefined as unknown as T));
  }

  private static formatFormValues<T>(values: IDnfFromValues<T>): IResultDnfFormValues<T> {
    return {
      forms: InnerDnfForm.formatDnfFormValues(values),
      ...Object.keys(values || {})
        .filter(key => !excludeFromValues.includes(key))
        .reduce((previousValue, currentValue) => {
          previousValue[currentValue] = values[currentValue];

          return previousValue;
        }, {} as IObjectWithIndex)
    };
  }

  private static hasErrors(fieldsError: Record<string, string[] | undefined> | string[]): boolean {
    return fieldsError && Object.keys(fieldsError).some(fieldName => {
      // tslint:disable-next-line:ban-ts-ignore
      // @ts-ignore
      const field = fieldsError[fieldName];
      if (Array.isArray(field)) {
        return field.some(InnerDnfForm.hasErrors);
      }

      if (field && typeof (field) === "object") {
        return InnerDnfForm.hasErrors(field);
      }

      return !!field;
    });
  }

  private static swapElements<T>(array: T[], firstIndex: number, secondIndex: number): void {
    const firstElement = array[firstIndex];

    if (array.length > firstIndex) {
      array[firstIndex] = array[secondIndex];
    }
    if (array.length > secondIndex) {
      array[secondIndex] = firstElement;
    }
  }

  private id: number;

  public constructor(props: FormComponentProps & ICommonDnfProps<TValues> & IDnfFormProps<TElement, TValues>) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);

    if (props.initialState && props.initialState.forms) {
      const initialForms: number[][] = [];
      const initialElements: TElement[] = [];
      let initialId = 0;

      props.initialState.forms
        .filter((_: TElement[], index: number) => !this.props.orBehaviorDisabled || index === 0)
        .forEach((elements: TElement[]) => {
            const form: number[] = [];

            elements.forEach((element) => {
              form.push(initialId++);
              initialElements.push(element);
            });

            initialForms.push(form);
          }
        );

      this.id = initialId;
      this.state = {initialForms, initialElements};
    } else {
      this.id = 1;
    }
  }

  public componentDidMount(): void {
    if (this.props.initialState) {
      const initialValues: IClearDnfFromValues = {};

      Object.keys(this.props.initialState)
        .filter(key => !excludeFromValues.includes(key))
        .forEach(key => initialValues[key] = this.props.initialState && this.props.initialState[key]);

      this.props.form.setFieldsValue(initialValues);
    }
    if (this.state && this.state.initialForms && this.state.initialElements) {
      this.state.initialElements.forEach((value, index) => {
        const result: IObjectWithIndex = {};
        // tslint:disable-next-line:ban-ts-ignore
        // @ts-ignore
        Object.keys(value || {}).forEach(key => result[`elements[${index}].${key}`] = value && value[key]);
        this.props.form.setFieldsValue(result);
      });
    }

    this.props.form.validateFields();
  }

  public componentDidUpdate(): void {
    // tslint:disable-next-line:no-any
    const values = this.getDnfFormValues();

    if (!isEqual(values, this.state && this.state.lastFormValues)) {
      this.setState({lastFormValues: values});
      this.props.form.validateFields({force: true});
      if (this.props.onChange && (this.state && this.state.lastFormValues)) { // && for ignore init change
        this.props.onChange(this.getResultFormValues(), InnerDnfForm.hasErrors(this.props.form.getFieldsError()));
      }
    }
  }

  public render(): JSX.Element {
    const {getFieldDecorator, getFieldValue} = this.props.form;

    getFieldDecorator("forms", {initialValue: this.state && this.state.initialForms || [[0]]});
    const forms: number[][] = getFieldValue("forms") || [];
    const initialStateForms = this.props.initialState && this.props.initialState.forms;

    const disableDisjunctionSwap = this.props.disableRowSwap || forms.length === 1;

    const dnfFormItems = forms.map((form, formIndex: number) => {
      const disableConjunctionSwap = this.props.disableRowSwap || form.length === 1;

      return (
        <div key={form.join("_")} style={this.props.wrapperStyle}>
          {formIndex !== 0 && orDivider}
          <div
            style={{display: "flex"}}
          >
            <Form.Item
              style={{
                flexGrow: 1,
                marginBottom: 0,
                maxWidth: "100%"
              }}
            >
              {getFieldDecorator(`formValidator[${formIndex}]`, { // Wrapper for field validating
                rules: [{
                  // tslint:disable-next-line:no-any
                  validator: (_: any, __: any, callback: any): void => {
                    const values = this.getDnfFormValues();

                    this.props.orElementValidator
                      ? this.props.orElementValidator(
                      (values.forms && values.forms[formIndex])
                        ? values.forms[formIndex].map(i => values.elements && values.elements[i])
                        : undefined, callback)
                      : callback();
                  },
                }],
              })(
                <Card
                  style={{flexGrow: 1, margin: "5px 0px", padding: "5px 10px", ...this.props.andCardStyle}}
                  bodyStyle={{padding: 0}}
                  bordered={!this.props.disableAndFormBorder}
                >
                  {form.map((elementIndex, index) => (
                    <div
                      key={elementIndex}
                    >
                      <AndFormRowElement
                        isFirst={index === 0}
                        isLast={form.length > 0 && (index === form.length - 1)}
                        addButtons={this.props.allowClear || (form.length > 1)}
                        onUpClick={(): void => this.swapElement(formIndex, index, index - 1)}
                        onDownClick={(): void => this.swapElement(formIndex, index, index + 1)}
                        onDeleteClick={(): void => this.updateFormProps(dnfForms => {
                          if (!dnfForms[formIndex] || dnfForms[formIndex].length === 0) {
                            return;
                          }
                          dnfForms[formIndex].splice(index, 1);
                        })}
                        disableRowSwap={disableConjunctionSwap}
                        rowComponent={this.props.rowComponent({
                          form: this.props.form,
                          id: elementIndex,
                          initialValues: initialStateForms
                            && initialStateForms[formIndex]
                            && initialStateForms[formIndex][index]
                        })}
                        buttonAlignment={this.props.buttonAlignment}
                      />
                      {this.props.withDivider && divider}
                    </div>
                  ))}
                  <Form.Item {...formItemLayoutWithOutLabel}>
                    <Button
                      htmlType="button"
                      type="dashed"
                      onClick={(): void => this.updateFormProps(dnfForms => dnfForms[formIndex] && dnfForms[formIndex].push(this.id++))}
                      style={{width: "100%"}}
                    >
                      <LegacyIcon type="plus"/> {this.props.addConjunctionButtonTitle || "Добавить Конъюнкцию"}
                    </Button>
                  </Form.Item>
                </Card>
              )}
            </Form.Item>
            {(forms.length > 1) ? (
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  // tslint:disable-next-line:no-magic-numbers
                  marginLeft: disableDisjunctionSwap ? 5 : -57,
                  marginRight: 5
                }}
              >
                <Button.Group style={{transform: "translate(50%) rotate(90deg) translateY(50%)", display: "flex"}}>
                  {!disableDisjunctionSwap && <Button
                    size="small"
                    htmlType="button"
                    icon="arrow-left"
                    className={DNF_BUTTON}
                    disabled={formIndex === 0}
                    onClick={(): void => this.updateFormProps(dnfForms => InnerDnfForm.swapElements(dnfForms, formIndex, formIndex - 1))}
                  />}
                  <Button
                    size="small"
                    htmlType="button"
                    icon="minus-circle"
                    className={DNF_BUTTON}
                    style={{transform: "rotate(90deg)"}}
                    onClick={(): void => this.updateFormProps(dnfForms => {
                      if (dnfForms.length === 0) {
                        return;
                      }
                      dnfForms.splice(formIndex, 1);
                    })}
                  />
                  {!disableDisjunctionSwap && (
                    <Button
                      size="small"
                      className={DNF_BUTTON}
                      htmlType="button"
                      icon="arrow-right"
                      disabled={formIndex === forms.length - 1}
                      onClick={(): void => this.updateFormProps(dnfForms => InnerDnfForm.swapElements(dnfForms, formIndex, formIndex + 1))}
                    />
                  )}
                </Button.Group>
              </div>
            ) : null}
          </div>
        </div>
      );
    });

    const hasErrors = InnerDnfForm.hasErrors(this.props.form.getFieldsError());

    const allFormItems = (
      <>
        {this.props.additionalFormItems && this.props.additionalFormItems(this.props.form)}
        {dnfFormItems}
        {!this.props.orBehaviorDisabled && <Form.Item {...formItemLayout}>
          <Button
            htmlType="button"
            type="dashed"
            onClick={(): void => this.updateFormProps(dnfForms => dnfForms.push([this.id++]))}
            style={{width: "100%"}}
          >
            <LegacyIcon type="plus"/> {this.props.addDisjunctionButtonTitle || "Добавить Дизъюнкцию"}
          </Button>
        </Form.Item>}
        {!this.props.disableDefaultSubmitButton && <Form.Item {...formItemLayout}>
          <Button
            loading={this.props.loading}
            disabled={hasErrors}
            type="primary"
            htmlType="submit"
          >
            {this.props.defaultSubmitButtonTitle || "Сохранить"}
          </Button>
        </Form.Item>}
      </>
    );

    return (
      <Form
        onSubmit={this.handleSubmit}
        style={{width: "100%"}}
      >
        {this.props.formItemsWrapper ? this.props.formItemsWrapper({
          formItems: allFormItems,
          formValues: this.getResultFormValues(),
          hasErrors,
          loading: this.props.loading
        }) : allFormItems}
      </Form>
    );
  }

  @autobind
  private getDnfFormValues(): IDnfFromValues<TElement> {
    // tslint:disable-next-line:no-any
    return this.props.form.getFieldsValue() as any;
  }

  private getResultFormValues(): TValues {
    const formattedFormValues = InnerDnfForm.formatFormValues(this.getDnfFormValues());

    // tslint:disable-next-line:no-any
    return this.props.valuesMapper ? this.props.valuesMapper(formattedFormValues) : (formattedFormValues as any);
  }

  private handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    // tslint:disable-next-line:no-any
    this.props.form.validateFields((err: any) => {
      if (!err) {
        if (this.props.onSubmit) {
          this.props.onSubmit(this.getResultFormValues());
        }
      }
    });
  }

  private swapElement(formIndex: number, firstElementIndex: number, secondElementIndex: number): void {
    this.updateFormProps(forms =>
      forms[formIndex] && InnerDnfForm.swapElements(forms[formIndex], firstElementIndex, secondElementIndex));
  }

  private updateFormProps(updateLogic: (forms: number[][]) => void): void {
    const forms = this.props.form.getFieldValue("forms");
    updateLogic(forms);
    this.props.form.setFieldsValue({forms});
  }

}

// tslint:disable-next-line:max-classes-per-file
export class  DnfForm<T, S> extends React.Component<FormCreateKostyl<InnerDnfForm<T,S>>> {

  private element: JSX.Element | null = null;

  public render(): React.ReactNode {
    if (!this.element) {
      this.element = React.createElement(Form.create()(InnerDnfForm), this.props);

      return this.element;
    }

    return React.cloneElement(this.element, this.props)
  }

}
