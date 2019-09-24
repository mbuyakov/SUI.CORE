import {DatePicker, Form, Icon, Input, InputNumber, Select, Switch} from 'antd';
import {FormItemProps} from "antd/lib/form";
import {GetFieldDecoratorOptions, WrappedFormUtils} from "antd/lib/form/Form";
import {OptionProps, SelectProps} from "antd/lib/select";
import * as React from 'react';

import {ActionType, FilterType, getRussianName, isListAction, isMomentType} from '../../utils';

export function getActions(filterType?: FilterType, constant?: boolean): ActionType[] {
  let actions: ActionType[] = [ActionType.EQUAL];

  if (filterType !== FilterType.BOOLEAN) {
    actions = actions.concat([
      ActionType.NOT_EQUAL,
      ActionType.MORE,
      ActionType.MORE_OR_EQUAL,
      ActionType.LESS,
      ActionType.LESS_OR_EQUAL
    ]);
  }

  if (constant) {
    if (filterType !== FilterType.BOOLEAN) {
      actions = actions.concat([
        ActionType.FILLED,
        ActionType.NOT_FILLED
      ]);
    }

    if (filterType === FilterType.STRING) {
      actions = actions.concat([
        ActionType.LIKE,
        ActionType.NOT_LIKE
      ]);
    }

    if (!isMomentType(filterType) && filterType !== FilterType.BOOLEAN) {
      actions = actions.concat([
        ActionType.IN,
        ActionType.NOT_IN
      ]);
    }
  }

  return actions;
}

export function getInputElement<Props>(type: FilterType | undefined, action: ActionType | undefined, props: Props): JSX.Element {
  if (isListAction(action)) {
    return (
      <Select
        mode="tags"
        dropdownStyle={{display: "none"}}
        {...props}
      />
    )
  }

  switch (type) {
    case FilterType.NUMBER:
      return (<InputNumber {...props} style={{width: "100%"}}/>);
    case FilterType.DATE:
    case FilterType.TIMESTAMP:
      return (
        <DatePicker
          {...props}
          showTime={type === FilterType.TIMESTAMP}
        />
      );
    case FilterType.BOOLEAN:
      return (
        <Switch
          {...props}
          style={{marginTop: 0}}
          checkedChildren={<Icon type="check"/>}
          unCheckedChildren={<Icon type="close"/>}
        />
      );
    default:
      return (<Input {...props} style={{width: "100%"}}/>);
  }
}

export function getValuePropName(type: FilterType | undefined): string {
  switch (type) {
    case FilterType.BOOLEAN:
      return "checked";
    default:
      return "value";
  }
}

export function generateSelectFormItem(
  form: WrappedFormUtils,
  decoratorName: string,
  selectData: OptionProps[],
  props?: {
    decoratorOptions?: GetFieldDecoratorOptions;
    formItemProps?: FormItemProps;
    selectProps?: SelectProps<ActionType>;
  }): JSX.Element {
  const {getFieldDecorator} = form;
  const safeProps = props || {};

  return (
    <Form.Item
      style={{marginBottom: 0}}
      {...safeProps.formItemProps}
    >
      {getFieldDecorator(decoratorName, {
        ...safeProps.decoratorOptions
      })(
        <Select
          style={{width: "100%"}}
          {...safeProps.selectProps}
        >
          {selectData.map(optionProps => (
            <Select.Option
              {...optionProps}
            />
          ))}
        </Select>
      )}
    </Form.Item>
  );
}

export function generateActionSelectFormItem(
  form: WrappedFormUtils,
  decoratorName: string,
  actions: ActionType[],
  props?: {
    decoratorOptions?: GetFieldDecoratorOptions;
    formItemProps?: FormItemProps;
    selectProps?: SelectProps<ActionType>;
  }): JSX.Element {
  const safeProps = props || {};

  return generateSelectFormItem(
    form,
    decoratorName,
    actions.map(actionType => ({value: actionType, children: getRussianName(actionType)})),
    {
      ...safeProps,
      decoratorOptions: {
        initialValue: ActionType.EQUAL,
        normalize: (value): ActionType => value && actions.includes(value)
          ? value
          : ActionType.EQUAL,
        ...safeProps.decoratorOptions
      }
    }
  );
}
