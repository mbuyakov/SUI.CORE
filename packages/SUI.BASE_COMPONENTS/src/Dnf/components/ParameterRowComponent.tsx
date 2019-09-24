// tslint:disable:no-any
import {Form, Switch, Tooltip} from "antd";
import {GetFieldDecoratorOptions} from "antd/lib/form/Form";
import {SelectProps} from "antd/lib/select";
import {SwitchProps} from "antd/lib/switch";
import autobind from 'autobind-decorator';
import * as React from "react";

import {ActionType, emptyFilter, FilterType, isListAction} from "../../utils";
import {AbstractDnfFormRowElement} from "../AbstractDnfFormRowElement";
import {generateActionSelectFormItem, getInputElement, getValuePropName} from "../utils";

export interface IFilterProps {
  actions: ActionType[];
  filterType?: FilterType;
}

interface IParameterRowComponentProps<TElement> {
  actionSelectProps?: SelectProps<ActionType>;
  constantSwitchProps?: SwitchProps;
  constantTooltipTitle?: string;
  simpleFilterDecoratorOptions?: Omit<GetFieldDecoratorOptions, "normalize" | "valuePropName">;
  type?: "full" | "onlyConstant" | "onlyNonConstant";
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  filterPropsGenerator(values: TElement): IFilterProps;
  firstParameterFormItemGenerator(values: TElement): JSX.Element;
  secondParameterFormItemGenerator?(values: TElement): JSX.Element;
}

export interface IParameterRowElementBase {
  action?: ActionType;
  constant?: boolean;
  simpleFilter?: any;
}

export abstract class ParameterRowComponent<TElement extends IParameterRowElementBase, TProps = {}, TState = {}>
  extends AbstractDnfFormRowElement<TElement, TProps, TState> {

  @autobind
  protected createParameterRow(props: IParameterRowComponentProps<TElement>): JSX.Element {
    const {getFieldDecorator, getFieldValue} = this.props.form;
    const values: TElement = getFieldValue(this.getElementName()) || this.props.initialValues || {};
    const filterProps = props.filterPropsGenerator(values);

    return (
      <div
        className={props.wrapperClassName}
        style={props.wrapperStyle}
      >
        {(!props.type || props.type === "full") && (
          <Form.Item
            style={{
              justifySelf: "right",
              marginBottom: 0,
              width: "fit-content"
            }}
          >
            <Tooltip title={props.constantTooltipTitle || "Константное сравнение"}>
              {getFieldDecorator(this.getDecoratorName("constant"), {
                initialValue: true,
                valuePropName: "checked"
              })(
                <Switch
                  {...props.constantSwitchProps}
                  style={{
                    marginTop: 0,
                    ...(props.constantSwitchProps && props.constantSwitchProps.style)
                  }}
                  onChange={this.onConstantSwitchChangeFunc(props, filterProps.actions, values.action)}
                />
              )}
            </Tooltip>
          </Form.Item>
        )}
        {props.firstParameterFormItemGenerator(values)}
        {generateActionSelectFormItem(
          this.props.form,
          this.getDecoratorName("action"),
          filterProps.actions,
          {
            decoratorOptions: {rules: [{required: true, message: "Не заполнено"}]},
            selectProps: {
              ...props.actionSelectProps,
              onChange: this.onActionSelectChangeFunc(props)
            }
          }
        )}
        {this.getFilterComponent(props, values, filterProps.filterType)}
      </div>
    );
  }

  @autobind
  protected defaultSimpleFilterValidator(): (rule: any, value: any, callback: any) => void {
    return (_, value, callback): void => {
      const parameterAction = this.props.form.getFieldValue(this.getDecoratorName("action"));

      if (isListAction(parameterAction) && (!value || (value as any[]).length === 0)) {
        callback("Список не заполнен");
      }
      // tslint:disable-next-line:triple-equals
      if (value == null && !emptyFilter(parameterAction)) {
        callback("Поле не заполнено");
      }

      callback();
    };
  }

  @autobind
  private getFilterComponent(
    props: IParameterRowComponentProps<TElement>,
    values: TElement,
    filterType?: FilterType
  ): JSX.Element {
    const {getFieldDecorator} = this.props.form;

    if (props.type === "onlyNonConstant" ? false : values.constant) {
      const filterProps = {
        disabled: emptyFilter(values.action),
        placeholder: "Введите значение"
      };

      return (
        <Form.Item
          style={{marginBottom: 0}}
        >
          {getFieldDecorator(this.getDecoratorName("simpleFilter"), {
            initialValue: filterType === FilterType.BOOLEAN ? false : null,
            ...props.simpleFilterDecoratorOptions,
            normalize: (value): any => emptyFilter(values.action) ? undefined : value,
            valuePropName: getValuePropName(filterType)
          })(
            getInputElement(filterType, values.action, filterProps)
          )}
        </Form.Item>
      );
    }

    if (props.secondParameterFormItemGenerator && props.type !== "onlyConstant") {
      return props.secondParameterFormItemGenerator(values);
    }

    return <span>Рендер отсутствует</span>;
  }

  @autobind
  private onActionSelectChangeFunc(props: IParameterRowComponentProps<TElement>): (action: ActionType, option: React.ReactElement | React.ReactElement[]) => void {
    return (action, option) => {
      if (emptyFilter(action)) {
        this.setField("simpleFilter", undefined);
      }
      if (props.actionSelectProps && props.actionSelectProps.onChange) {
        props.actionSelectProps.onChange(action, option);
      }
    };
  }

  @autobind
  private onConstantSwitchChangeFunc(
    props: IParameterRowComponentProps<TElement>,
    actions: ActionType[],
    action?: ActionType
  ): (checked: boolean, event: MouseEvent) => void {
    return (constant, event) => {
      if (!constant && action && !actions.includes(action)) {
        this.setField("action", ActionType.EQUAL)
      }
      if (props.constantSwitchProps && props.constantSwitchProps.onChange) {
        props.constantSwitchProps.onChange(constant, event);
      }
    }
  }

}
