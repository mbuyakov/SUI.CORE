import {DatePicker, Icon, Input, InputNumber, Select, Switch} from 'antd';
import * as React from 'react';

import {ActionType, FilterType, isListAction, isMomentType} from '../../utils';

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

export function getInputElement<Props>(type: FilterType, action: ActionType, props: Props): JSX.Element {
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

export function getValuePropName(type: FilterType): string {
  switch (type) {
    case FilterType.BOOLEAN:
      return "checked";
    default:
      return "value";
  }
}
