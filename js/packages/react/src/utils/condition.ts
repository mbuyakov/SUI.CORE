/* eslint-disable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any */
import {ActionType} from "./actionType";
import {FilterType} from "./filterType";

export function checkCondition(
  action: ActionType,
  filterType: FilterType,
  fieldValue: any,
  filterValue: any
): boolean {
  const hasFieldValue = fieldValue != null;
  let formattedFieldValue = hasFieldValue && (typeof (filterValue) === "string" || (Array.isArray(filterValue) && typeof (filterValue[0]) === "string"))
    ? String(fieldValue)
    : fieldValue;

  if (typeof (formattedFieldValue) === "string") {
    if (filterType === FilterType.DATE) {
      formattedFieldValue = formattedFieldValue.substr("YYYY-MM-DD".length);
    }
  }

  let inverse = false;
  let result: boolean | null = null;

  switch (action) {
    case ActionType.NOT_EQUAL:
      inverse = true;
    case ActionType.EQUAL:
      result = formattedFieldValue === filterValue;
      break;
    case ActionType.NOT_FILLED:
      inverse = true;
    case ActionType.FILLED:
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
    case ActionType.NOT_LIKE:
      inverse = true;
    case ActionType.LIKE:
      result = hasFieldValue && formattedFieldValue.search(filterValue) !== -1;
      break;
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
