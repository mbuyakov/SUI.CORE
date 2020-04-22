import {BaseForm} from "./BaseForm";

interface IClearField {
  emptyValue: any;
  fieldName: string;
}

export function clearFields(
  form: BaseForm,
  defaultEmptyValue: any,
  ...fieldNames: Array<string | IClearField>
): void {
  fieldNames.forEach(field => {
    if (typeof field === "string") {
      form.setFieldValue(field, defaultEmptyValue);
    } else {
      form.setFieldValue(field.fieldName, field.emptyValue)
    }
  })
}

export function clearFieldsWithUndefined(
  form: BaseForm,
  ...fieldNames: Array<string | IClearField>
): void {
  return clearFields(form, undefined, ...fieldNames);
}

export function clearFieldsWithEmptyString(
  form: BaseForm,
  ...fieldNames: Array<string | IClearField>
): void {
  return clearFields(form, "", ...fieldNames);
}

export function clearFieldsAfterChange(
  defaultEmptyValue: any,
  ...fieldNames: Array<string | IClearField>
): (value: any, form: BaseForm) => void {
  return (_, form) => clearFields(form, defaultEmptyValue, ...fieldNames);
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
