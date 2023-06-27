/* eslint-disable @typescript-eslint/no-explicit-any */
import {Form, FormItemProps} from "@sui/deps-antd";
import {RuleItem, RuleType} from "async-validator";
import autobind from "autobind-decorator";
import classNames from "classnames";
import * as React from "react";
import {SUIMaskedInput} from "@/SUIMaskedInput";
import {BASE_CARD_ITEM_LABEL_HORIZONTAL} from "@/styles";
import {SUIReactComponent} from "@/SUIReactComponent";

import {DEFAULT_ITEM_RENDERER} from "./BaseCardItemLayout";
import {BaseForm, IFormField, ValuesGetter} from "./BaseForm";
import {BaseFormContext} from "./BaseFormContext";
import {IObjectWithIndex} from "@sui/util-types";

const FILL_FIELD_TEXT = "Заполните поле";

const TITLE_STYLE: React.CSSProperties = {
  verticalAlign: "top",
  paddingRight: 12,
  color: "rgba(121, 119, 119, 0.65)",
  wordWrap: "break-word",
  paddingBottom: 8,
  paddingTop: 6
};

export type FixedRuleItem = Omit<RuleItem, "pattern"> & {
  pattern?: string | RegExp
};

export interface IBaseFormItemLayoutBase {
  fieldName: string;
  initialValue?: any;
  inputNode?: JSX.Element; // Required. Mark as non-required because IBaseFormItemLayoutMask
  required?: boolean;
  requiredType?: RuleType;
  rules?: FixedRuleItem[];
  title?: string | React.ReactNode;
  valuePropName?: string;
  afterChange?(value: any, form: BaseForm, oldValue: any): void,
  getValueFromEvent?(...args: any[]): any;
  helpRenderer?(error: string): string | JSX.Element;
  mapFormValuesToInputNodeProps?(get: ValuesGetter): IObjectWithIndex;
  mapFormValuesToRequired?(get: ValuesGetter): boolean;
  titleVerticalAlign?: "baseline" | "bottom" | "middle" | "sub" | "super" | "text-bottom" | "text-top" | "top";
  dataVerticalAlign?: "baseline" | "bottom" | "middle" | "sub" | "super" | "text-bottom" | "text-top" | "top";
  titleStyle?: React.CSSProperties;
  dataStyle?: React.CSSProperties;
  formItemStyle?: React.CSSProperties;
}

export type IBaseFormItemLayoutMask = Omit<IBaseFormItemLayoutBase, "inputNode" | "valuePropName" | "getValueFromEvent"> & {
  mask: string
  totalValueLength: number // Костыль
};

export type IBaseFormItemLayout = IBaseFormItemLayoutBase | IBaseFormItemLayoutMask;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function renderIBaseFormItemLayout(sourceItem: any, item: IBaseFormItemLayout, colspan: number): React.ReactNode {
  if (!item.fieldName) {
    return DEFAULT_ITEM_RENDERER(sourceItem, item, colspan);
  }

  return (<BaseFormItem {...mapMaskToBase(item)} colspan={colspan}/>);
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
    console.warn(item);
    throw new Error(`inputNode required at ${item.fieldName}`);
  }

  return item as IBaseFormItemLayoutBase;
}

export class BaseFormItem extends SUIReactComponent<IBaseFormItemLayoutBase & {
  colspan?: number
}, {
  error?: any
  hasErrorLatch?: boolean // Если хоть раз была ошибка - ставим true, не чистится никогда. Нужно на случай когда задисейбленное поле надо отредактировать(прилетела ошибка валидации)
  subscribedFormFieldValues: IObjectWithIndex
  value?: any
}> {

  private baseForm: BaseForm;
  private formFieldName?: string;
  private formField?: IFormField;
  private readonly subscribedFields: string[] = [];

  public constructor(props: IBaseFormItemLayoutBase) {
    super(props);
    this.state = {
      subscribedFormFieldValues: {},
    };
  }
  private TITLE_STYLE: React.CSSProperties = {
    verticalAlign: this.props.titleVerticalAlign || "top",
    paddingRight: 12,
    color: "rgba(121, 119, 119, 0.65)",
    wordWrap: "break-word",
    paddingBottom: 8,
    paddingTop: 6,
    ...this.props.titleStyle
  };

  private DATA_STYLE: React.CSSProperties = {
    verticalAlign: this.props.dataVerticalAlign || "top",
    ...this.props.dataStyle
  };

  public render(): React.ReactNode {
    return (
      <BaseFormContext.Consumer>
        {({baseForm, customInputNodesProps, customFinalInputNodesProps, initialValues, verticalLabel}): React.ReactNode => {
          this.baseForm = baseForm;
          const item = this.props;
          const valuePropName = item.valuePropName || "value";
          const required = item.required || (item.mapFormValuesToRequired && item.mapFormValuesToRequired(this.valueGetter));
          const requiredType = item.requiredType;

          if (!this.formField || this.formFieldName != item.fieldName) {
            this.formFieldName = item.fieldName;
            this.formField = baseForm.getOrCreateFormField(this.formFieldName);
            this.registerObservableHandler(this.formField.value.subscribe(value => this.setState({value})));
            this.registerObservableHandler(this.formField.error.subscribe(error => this.setState({error, hasErrorLatch: this.state.hasErrorLatch || !!error})));

            // Initial value
            if (initialValues?.hasOwnProperty?.(this.formFieldName)) {
              this.formField.value.setValue(initialValues[this.formFieldName]);
            } else if (item.initialValue != null) {
              this.formField.value.setValue(item.initialValue);
            }
            if (this.props.afterChange) {
              this.registerObservableHandler(this.formField.value.subscribe((value, oldValue) => {
                this.props.afterChange(value, this.baseForm, oldValue);
              }));
            }
          }

          if (item.rules) {
            this.formField.rules = item.rules;
          }

          if (required) {
            if (this.formField.rules.findIndex(rule => rule.required || false) < 0) {
              const requiredRule: RuleItem = {required: true, message: FILL_FIELD_TEXT};

              if (requiredType) {
                requiredRule.type = requiredType;
              }

              this.formField.rules.unshift(requiredRule);

              this.baseForm.validateField(item.fieldName);
            }
          }

          if (!required) {
            const index = this.formField.rules.findIndex(rule => rule.required || false);
            if (index >= 0) {
              this.formField.rules.splice(index, 1);
              this.baseForm.validateField(item.fieldName);
            }
          }

          const title = item.title && (
            <span className={classNames({[BASE_CARD_ITEM_LABEL_HORIZONTAL]: !verticalLabel, "ant-form-item-required": !!required})}>
             {item.title}:
            </span>
          );

          const errors = this.state.error;
          const hasErrorLatch = this.state.hasErrorLatch;

          const formItemProps: Partial<FormItemProps> = {
            help: errors
              ? (this.props.helpRenderer ? this.props.helpRenderer(errors) : errors)
              : undefined,
            validateStatus: errors ? "error" : "",
            style: this.props.formItemStyle,
          };

          let additionalProps: IObjectWithIndex = {};

          if (item.mapFormValuesToInputNodeProps) {
            additionalProps = item.mapFormValuesToInputNodeProps(this.valueGetter);
          }

          if (!customFinalInputNodesProps) {
            customFinalInputNodesProps = {};
          }

          if (!customInputNodesProps) {
            customInputNodesProps = {};
          }

          const formItem = (
            <Form.Item {...formItemProps}>
              {React.cloneElement(item.inputNode, {
                [valuePropName]: this.state.value,
                ...customInputNodesProps,
                ...item.inputNode.props,
                onChange: this.onChange,
                ...(hasErrorLatch ? {disabled: false} : {}),
                ...additionalProps,
                ...customFinalInputNodesProps,
                style: {
                  width: "100%",
                  ...item.inputNode.props.style,
                  ...customInputNodesProps.style,
                  ...additionalProps.style,
                  ...customFinalInputNodesProps.style
                },
              })}
            </Form.Item>
          );

          const data = verticalLabel
            ? (
              <td colSpan={2 + (this.props.colspan - 1) * 2} style={{verticalAlign: "top", paddingRight: 12}}>
                {title && (<div style={TITLE_STYLE}>{title}</div>)}
                <div aria-label={item.fieldName} style={this.DATA_STYLE}>{formItem}</div>
              </td>
            )
            : (
              <>
                {title && <td style={this.TITLE_STYLE}>{title}</td>}
                <td aria-label={item.fieldName} colSpan={(title ? 1 : 2) + ((this.props.colspan - 1) * 2)} style={{verticalAlign: "top", paddingBottom: 8}}>
                  {formItem}
                </td>
              </>
            );


          // if (verticalLabel) {
          //   data = (
          //     <div className={BASE_FORM_ITEM_VERTICAL}>
          //       {data}
          //     </div>
          //   );
          // }

          return data;
        }}
      </BaseFormContext.Consumer>
    );
  }

  public componentWillUnmount(): void {
    this.baseForm.removeField(this.formFieldName);
    super.componentWillUnmount();
  }

  @autobind
  private onChange(e: any): void {
    const _getValueFromEvent = this.props.getValueFromEvent || getValueFromEvent;
    const value = _getValueFromEvent(e);

    this.formField.value.setValue(value);
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
          this.setState({subscribedFormFieldValues: this.state.subscribedFormFieldValues});
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
  if (typeof e === "object" && typeof e.persist === "function") {
    e.persist();
  } else {
    console.debug("Unknown event type", e);
  }
  const {target} = e;

  return target.type === "checkbox" ? target.checked : target.value;
}
