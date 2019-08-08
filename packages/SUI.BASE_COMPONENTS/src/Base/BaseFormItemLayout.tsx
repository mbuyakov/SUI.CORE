/* tslint:disable:cyclomatic-complexity */
import {IObjectWithIndex} from "@smsoft/sui-core";
import {Form} from 'antd';
import {FormItemProps} from 'antd/lib/form';
import {GetFieldDecoratorOptions, WrappedFormUtils} from 'antd/lib/form/Form';
import * as React from 'react';

import {BASE_CARD_ITEM_LABEL_HORIZONTAL, BASE_FORM_ITEM_VERTICAL} from "../styles";

import {SUBMITTED_FIELD} from "./BaseForm";
import {BaseFormContext} from './BaseFormContext';
import {PersistedInput} from "./PersistedInput";

const FILL_FIELD_TEXT = 'Заполните поле';

// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
export interface IBaseFormItemLayout<T> {
  decoratorOptions?: GetFieldDecoratorOptions;
  fieldName: string;
  inputNode: JSX.Element;
  required?: boolean;
  title?: string | React.ReactNode;

  getFormItemProps?(form: WrappedFormUtils): FormItemProps;

  // tslint:disable-next-line:no-any
  mapFormValuesToInputNodeProps?(values: IObjectWithIndex): IObjectWithIndex
  mapFormValuesToRequired?(values: IObjectWithIndex): boolean
}

export type IBaseFormDescItemLayout<T> = IBaseFormItemLayout<T>// Omit<IBaseCardItemLayout<T>, 'tableProps' | 'containerStyle'>; {
//
// }

export function renderIBaseFormItemLayout<T>(item: IBaseFormItemLayout<T>): JSX.Element {
  return (
    <BaseFormContext.Consumer>
      {({form, formValues, verticalLabel}) => {
        const required = item.required || (item.mapFormValuesToRequired && item.mapFormValuesToRequired(formValues));

        const title = item.title && (
          <span className={verticalLabel ? "" : BASE_CARD_ITEM_LABEL_HORIZONTAL}>
            {item.title}:
          </span>
        );

        const isSubmitted = form.getFieldValue(SUBMITTED_FIELD);
        const fieldHasValue = form.getFieldValue(item.fieldName) != null;
        const isTouched = fieldHasValue || form.isFieldTouched(item.fieldName);
        const errors = form.getFieldError(item.fieldName);

        let formItemProps: FormItemProps = {
          help: (isTouched) ? errors : ((isSubmitted && required) ? FILL_FIELD_TEXT : ''),
          validateStatus: (isTouched ? errors : (isSubmitted && required)) ? 'error' : '',
        };

        if (item.getFormItemProps) {
          formItemProps = {...formItemProps, ...item.getFormItemProps(form)};
        }

        let decoratorOptions = item.decoratorOptions;

        if (required) {
          // tslint:disable-next-line:triple-equals
          if (decoratorOptions == null || decoratorOptions.rules == null || decoratorOptions.rules.findIndex(rule => rule.required || false) < 0) {
            // tslint:disable-next-line:triple-equals
            if (decoratorOptions == null) {
              decoratorOptions = {};
            }
            // tslint:disable-next-line:triple-equals
            if (decoratorOptions.rules == null) {
              decoratorOptions.rules = [];
            }
            decoratorOptions.rules.push({required: true, message: FILL_FIELD_TEXT});
          }
        }

        // tslint:disable-next-line:no-any
        let additionalProps: IObjectWithIndex = {};

        if (item.mapFormValuesToInputNodeProps) {
          additionalProps = item.mapFormValuesToInputNodeProps(formValues);
        }
        let data = (
          <>
            {title}
            <Form.Item {...formItemProps}>
              {form.getFieldDecorator(item.fieldName, decoratorOptions)(
                <PersistedInput alwaysUpdate={!!item.mapFormValuesToInputNodeProps} formKostyl={form} fieldNameKostyl={item.fieldName} requiredKostyl={!!required}>
                  {React.cloneElement(item.inputNode, {...additionalProps, style: {width: '100%', ...item.inputNode.props.style, ...additionalProps.style}})}
                </PersistedInput>
              )}
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
