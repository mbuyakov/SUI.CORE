// tslint:disable:no-any ban-ts-ignore
import {ActionType} from "./actionType";
import {FilterType} from "./filterType";

// tslint:disable-next-line:cyclomatic-complexity
export function checkCondition(
  action: ActionType,
  filterType: FilterType,
  fieldValue: any,
  filterValue: any
): boolean {
  // tslint:disable-next-line:triple-equals
  const hasFieldValue = fieldValue != null;
  let formattedFieldValue = hasFieldValue && (typeof(filterValue) === "string" || (Array.isArray(filterValue) && typeof(filterValue[0]) === "string"))
    ? String(fieldValue)
    : fieldValue;

  if (typeof(formattedFieldValue) === "string") {
    if (filterType === FilterType.DATE) {
      formattedFieldValue = formattedFieldValue.substr("YYYY-MM-DD".length);
    }
  }

  let inverse = false;
  let result: boolean | null = null;

  // tslint:disable-next-line:switch-default
  switch (action) {
    // @ts-ignore
    case ActionType.NOT_EQUAL:
      inverse = true;
    case ActionType.EQUAL:
      result = formattedFieldValue === filterValue;
      break;
    // @ts-ignore
    case ActionType.NOT_FILLED:
      inverse = true;
    case ActionType.FILLED:
      // tslint:disable-next-line:triple-equals
      result = hasFieldValue;
      break;
    case ActionType.LESS:
      result = hasFieldValue && formattedFieldValue < filterValue;
      break;
    case ActionType.LESS_OR_EQUAL:
      result = hasFieldValue && formattedFieldValue <= filterValue;
      break;
    case ActionType.MORE:
      result = hasFieldValue && formattedFieldValue > filterValue;
      break;
    case ActionType.MORE_OR_EQUAL:
      result = hasFieldValue && formattedFieldValue >= filterValue;
      break;
    // @ts-ignore
    case ActionType.NOT_LIKE:
      inverse = true;
    case ActionType.LIKE:
      // tslint:disable-next-line:triple-equals
      result = hasFieldValue && formattedFieldValue.search(filterValue) !== -1;
      break;
    // @ts-ignore
    case ActionType.NOT_IN:
      inverse = true;
    case ActionType.IN:
      result = (filterValue || []).includes(formattedFieldValue);
  }

  if (result === null) {
    throw new Error(`Unsupported ActionType: ${action}`);
  }

  return inverse ? !result : result;
}
