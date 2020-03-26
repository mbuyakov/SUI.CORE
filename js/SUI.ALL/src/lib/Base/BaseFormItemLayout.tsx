/* tslint:disable:cyclomatic-complexity no-any */
import { Form } from '@ant-design/compatible';
import { FormItemProps } from 'antd/lib/form';
import { RuleItem } from 'async-validator';
import autobind from 'autobind-decorator';
import classNames from 'classnames';
import * as React from 'react';

import { IObjectWithIndex } from '../other';
import { BASE_CARD_ITEM_LABEL_HORIZONTAL, BASE_FORM_ITEM_VERTICAL } from '../styles';
import { SUIMaskedInput } from '../SUIMaskedInput';
import { SUIReactComponent } from '../SUIReactComponent';

import { BaseForm, IFormField, SUBMITTED_FIELD, ValuesGetter } from './BaseForm';
import { BaseFormContext } from './BaseFormContext';

// tslint:disable-next-line:no-import-side-effect

const FILL_FIELD_TEXT = 'Заполните поле';

export type FixedRuleItem = Omit<RuleItem, 'pattern'> & {
  pattern?: string | RegExp
}

export interface IBaseFormItemLayoutBase {
  fieldName: string;
  initialValue?: any;
  inputNode?: JSX.Element; // Required. Mark as non-required because IBaseFormItemLayoutMask
  required?: boolean;
  rules?: FixedRuleItem[];
  title?: string | React.ReactNode;
  valuePropName?: string;

  afterChange?(value: any, form: BaseForm): void,
  getValueFromEvent?(...args: any[]): any;
  mapFormValuesToInputNodeProps?(get: ValuesGetter): IObjectWithIndex;
  mapFormValuesToRequired?(get: ValuesGetter): boolean;
}

export type IBaseFormItemLayoutMask = Omit<IBaseFormItemLayoutBase, 'inputNode' | 'valuePropName' | 'getValueFromEvent'> & {
  mask: string
  totalValueLength: number // Костыль
}

export type IBaseFormItemLayout = IBaseFormItemLayoutBase | IBaseFormItemLayoutMask;

export type IBaseFormDescItemLayout = IBaseFormItemLayout;

export function renderIBaseFormItemLayout<T>(item: IBaseFormItemLayout, colspan: number): JSX.Element {
  return (<BaseFormItem {...mapMaskToBase(item)}/>);
}

export function mapMaskToBase(item: IBaseFormItemLayout): IBaseFormItemLayoutBase {
  if ((item as IBaseFormItemLayoutMask).mask) {
    if (!(item as IBaseFormItemLayoutBase).rules) {
      (item as IBaseFormItemLayoutBase).rules = [];
    }
    (item as IBaseFormItemLayoutBase).rules.unshift({
      len: (item as IBaseFormItemLayoutMask).totalValueLength,
      message: `Заполните поле по маске ${(item as IBaseFormItemLayoutMask).mask}`,
    });
    (item as IBaseFormItemLayoutBase).inputNode = (<SUIMaskedInput mask={(item as IBaseFormItemLayoutMask).mask}/>);
  }

  if (!(item as IBaseFormItemLayoutMask).mask && !(item as IBaseFormItemLayoutBase).inputNode) {
    throw new Error('inputNode required');
  }

  return item as IBaseFormItemLayoutBase;
}

export class BaseFormItem extends SUIReactComponent<IBaseFormItemLayoutBase, {
  error?: any
  subscribedFormFieldValues: IObjectWithIndex
  value?: any
}> {

  private baseForm: BaseForm;
  private formField?: IFormField;
  private readonly subscribedFields: string[] = [];

  public constructor(props: IBaseFormItemLayoutBase) {
    super(props);
    this.state = {
      subscribedFormFieldValues: {},
    };
  }

  public render(): React.ReactNode {
    return (
      <BaseFormContext.Consumer>
        {({ baseForm, verticalLabel, customInputNodesProps, customFinalInputNodesProps }): React.ReactNode => {
          this.baseForm = baseForm;
          const item = this.props;
          const valuePropName = item.valuePropName || 'value';
          const required = item.required || (item.mapFormValuesToRequired && item.mapFormValuesToRequired(this.valueGetter));

          if (!this.formField) {
            this.formField = baseForm.getOrCreateFormField(item.fieldName);
            this.registerObservableHandler(this.formField.value.subscribe(value => this.setState({ value })));
            this.registerObservableHandler(this.formField.error.subscribe(error => this.setState({ error })));
            // tslint:disable-next-line:triple-equals
            if (item.initialValue != null) {
              this.formField.value.setValue(item.initialValue);
            }
          }

          if (item.rules) {
            this.formField.rules = item.rules;
          }

          if (required) {
            if (this.formField.rules.findIndex(rule => rule.required || false) < 0) {
              this.formField.rules.unshift({ required: true, message: FILL_FIELD_TEXT });
              // tslint:disable-next-line:no-floating-promises
              this.baseForm.validateField(item.fieldName);
            }
          }

          if (!required) {
            const index = this.formField.rules.findIndex(rule => rule.required || false);
            if (index >= 0) {
              this.formField.rules.splice(index, 1);
              // tslint:disable-next-line:no-floating-promises
              this.baseForm.validateField(item.fieldName);
            }
          }

          const title = item.title && (
            <span className={classNames({ [BASE_CARD_ITEM_LABEL_HORIZONTAL]: !verticalLabel, 'ant-form-item-required': !!required })}>
             {item.title}:
            </span>
          );

          const isSubmitted = baseForm.getFieldValue(SUBMITTED_FIELD);
          // tslint:disable-next-line:triple-equals
          const fieldHasValue = baseForm.getFieldValue(item.fieldName) != null;
          const isTouched = fieldHasValue || baseForm.isFieldTouched(item.fieldName);
          const errors = this.state.error;

          const formItemProps: Partial<FormItemProps> = {
            help: (isTouched) ? errors : ((isSubmitted && required) ? FILL_FIELD_TEXT : ''),
            validateStatus: (isTouched ? errors : (isSubmitted && required)) ? 'error' : '',
          };

          let additionalProps: IObjectWithIndex = {};

          if (item.mapFormValuesToInputNodeProps) {
            additionalProps = item.mapFormValuesToInputNodeProps(this.valueGetter);
          }

          if (!customFinalInputNodesProps) {
            // tslint:disable-next-line:no-parameter-reassignment
            customFinalInputNodesProps = {};
          }

          if (!customInputNodesProps) {
            // tslint:disable-next-line:no-parameter-reassignment
            customInputNodesProps = {};
          }

          let data = (
            <>
              {title}
              <Form.Item {...formItemProps}>
                {React.cloneElement(item.inputNode, {
                  [valuePropName]: this.state.value,
                  ...customInputNodesProps,
                  ...item.inputNode.props,
                  onChange: this.onChange,
                  ...(errors ? {disabled: false} : {}),
                  ...additionalProps,
                  ...customFinalInputNodesProps,
                  style: {
                    width: '100%',
                    ...item.inputNode.props.style,
                    ...customInputNodesProps.style,
                    ...additionalProps.style,
                    ...customFinalInputNodesProps.style
                  },
                })}
              </Form.Item>
            </>
          );

          if (verticalLabel) {
            data = (
              <div className={BASE_FORM_ITEM_VERTICAL}>
                {data}
              </div>
            );
          }

          return data;
        }}
      </BaseFormContext.Consumer>
    );
  }

  @autobind
  private onChange(e: any): void {
    // tslint:disable-next-line:variable-name
    const _getValueFromEvent = this.props.getValueFromEvent || getValueFromEvent;
    const value = _getValueFromEvent(e);

    this.formField.value.setValue(value);

    if (this.props.afterChange) {
      this.props.afterChange(value, this.baseForm);
    }
  }

  @autobind
  private valueGetter(fields: string[]): IObjectWithIndex {
    return fields.reduce((obj, field) => {
      if (this.subscribedFields.includes(field)) {
        obj[field] = this.state.subscribedFormFieldValues[field];
      } else {
        const formField = this.baseForm.getOrCreateFormField(field);
        this.registerObservableHandler(formField.value.subscribe(newValue => {
          this.state.subscribedFormFieldValues[field] = newValue;
          this.setState({ subscribedFormFieldValues: this.state.subscribedFormFieldValues });
        }));
        this.subscribedFields.push(field);
        const value = formField.value.getValue();
        this.state.subscribedFormFieldValues[field] = value;

        obj[field] = value;
      }

      return obj;
    }, {} as IObjectWithIndex);
  }
}


function getValueFromEvent(e: any): any {
  // To support custom element
  if (!e || !e.target) {
    return e;
  }
  if (typeof e === 'object' && typeof e.persist === 'function') {
    e.persist();
  } else {
    console.warn('Unknown event type', e);
  }
  const { target } = e;

  return target.type === 'checkbox' ? target.checked : target.value;
}
