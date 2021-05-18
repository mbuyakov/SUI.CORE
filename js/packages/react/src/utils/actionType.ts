
export enum ActionType {
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  MORE = 'MORE',
  MORE_OR_EQUAL = 'MORE_OR_EQUAL',
  LESS = 'LESS',
  LESS_OR_EQUAL = 'LESS_OR_EQUAL',
  FILLED = 'FILLED',
  NOT_FILLED = 'NOT_FILLED',
  LIKE = 'LIKE',
  NOT_LIKE = 'NOT_LIKE',
  IN = 'IN',
  NOT_IN = 'NOT_IN'
}

// Указывает, требуется ли значение для фильра
export function emptyFilter(action?: ActionType): boolean {
  return !!action && (action === ActionType.FILLED || action === ActionType.NOT_FILLED);
}

// Указывает, применим ли этот фильтр только для чисел
export function isNumberAction(action?: ActionType): boolean {
  return !!action && [
    ActionType.MORE,
    ActionType.MORE_OR_EQUAL,
    ActionType.LESS,
    ActionType.LESS_OR_EQUAL
  ].includes(action);
}

export function isListAction(action?: ActionType): boolean {
  return !!action && [ActionType.IN, ActionType.NOT_IN].includes(action);
}

// Возвращает знак ActionType, если это возможно
export function getSign(action?: ActionType): string | ActionType | undefined {
  switch (action) {
    case ActionType.EQUAL:
      return "=";
    case ActionType.NOT_EQUAL:
      return "!=";
    case ActionType.MORE:
      return ">";
    case ActionType.MORE_OR_EQUAL:
      return ">=";
    case ActionType.LESS:
      return "<";
    case ActionType.LESS_OR_EQUAL:
      return "<=";
    default:
      return action;
  }
}

// Возвращает русское имя ActionType
export function getRussianName(action?: ActionType): string | undefined {
  switch (action) {
    case ActionType.FILLED:
      return "заполнено";
    case ActionType.NOT_FILLED:
      return "не заполнено";
    case ActionType.LIKE:
      return "совпадает  c";
    case ActionType.NOT_LIKE:
      return "не совпадает с";
    case ActionType.IN:
      return "входит в";
    case ActionType.NOT_IN:
      return "не входит в";
  }
  const sign = getSign(action);

  return sign && sign.toString();
}

// Возвращает sql фильтр
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
export function getSqlFilter(field?: string, action?: ActionType, filter?: any): string | undefined {
  switch (action) {
    case ActionType.EQUAL:
    case ActionType.NOT_EQUAL:
    case ActionType.MORE:
    case ActionType.MORE_OR_EQUAL:
    case ActionType.LESS:
    case ActionType.LESS_OR_EQUAL:
      return `${field} ${getSign(action)} ${filter}`;
    case ActionType.FILLED:
      return `${field} IS NOT NULL`;
    case ActionType.NOT_FILLED:
      return `${field} IS NULL`;
    case ActionType.LIKE:
    case ActionType.NOT_LIKE:
      return `${field} ${action.replace('_', ' ')} ${filter}`;
    case ActionType.IN:
    case ActionType.NOT_IN:
      return `${field} ${action.replace('_', ' ')} (${filter})`;
    default:
      return undefined;
  }
}
