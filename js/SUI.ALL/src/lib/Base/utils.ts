// tslint:disable:no-any
import {BaseForm} from "./BaseForm";

interface IClearField {
  emptyValue: any;
  fieldName: string;
}

export function clearFieldsAfterChange(
  defaultEmptyValue: any,
  ...fieldNames: Array<string | IClearField>
): (value: any, form: BaseForm) => void {
  return (_, form) => fieldNames.forEach(field => {
    if (typeof field === "string") {
      form.setFieldValue(field, defaultEmptyValue);
    } else {
      form.setFieldValue(field.fieldName, field.emptyValue)
    }
  })
}

export function clearFieldsWithUndefinedAfterChange(
  ...fieldNames: Array<string | IClearField>
): (value: any, form: BaseForm) => void {
  return clearFieldsAfterChange(undefined, ...fieldNames);
}

export function clearFieldsWithEmptyStringAfterChange(
  ...fieldNames: Array<string | IClearField>
): (value: any, form: BaseForm) => void {
  return clearFieldsAfterChange("", ...fieldNames);
}
