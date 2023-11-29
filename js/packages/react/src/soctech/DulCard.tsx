/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {dateDisabledForIssueDate, DEPARTMENT_CODE_DESC, DEPARTMENT_CODE_REGEX, IObjectWithIndex, MomentFormat, Nullable} from "@sui/core";
import moment, {Moment} from "moment";
import {DatePicker, DatePickerProps} from "antd";
import {IBaseCardRowLayout, IBaseFormItemLayout, ValuesGetter} from "@/Base";
import {CustomInputWithRegex, CustomInputWithRegexProps, DulTypeSelector, IDulTypeSelectorProps} from "@/Inputs";
import {DulService, IallDocTypes} from "@/soctech/DulService";
import {datePickerLocaleRu} from "@/antdMissedExport";
import {SUIDepartmentCodeInput} from "@/SUIDepartmentCodeInput";

export const issuedByRegex = "^[0-9А-Яа-я\\s№.\\-\"\'()]{1,250}$";
export const issuedByDesc = "Разрешены русские буквы, цифры и символы №.-\"\'() до 250 знаков";
export const departmentCodeMask = "111-111";

export interface IDulCardFormItemsProps<T = any> {
  birthday?: Nullable<string> | ((get: ValuesGetter) => Nullable<string>);
  checkDisabled?: boolean;
  disabled?: boolean | ((get: ValuesGetter) => boolean | undefined);
  disableDocTypeSelect?: boolean;
  required?: boolean;
  fieldNames?: {
    docTypeId?: string;
    series?: string;
    number?: string;
    date?: string;
    departmentCode?: string;
    issuedBy?: string;
  };
  layout?: "default" | "narrow" | DulCardLayout<T>;
}

export interface IDulCardLayoutParams {
  docTypeItem: IBaseFormItemLayout;
  seriesItem: IBaseFormItemLayout;
  numberItem: IBaseFormItemLayout;
  dateItem: IBaseFormItemLayout;
  departmentCodeItem: IBaseFormItemLayout;
  issuedByItem: IBaseFormItemLayout;
}

export type DulCardLayout<T = any> = (params: IDulCardLayoutParams) => Array<IBaseCardRowLayout<T, IBaseFormItemLayout>>;

export function dulCardFormItems<T = any>(props: IDulCardFormItemsProps<T>): Array<IBaseCardRowLayout<T, IBaseFormItemLayout>> {
  const docTypeIdFieldName = props.fieldNames?.docTypeId || "docTypeId";
  const seriesFieldName = props.fieldNames?.series || "series";
  const numberFieldName = props.fieldNames?.number || "number";
  const dateFieldName = props.fieldNames?.date || "date";
  const departmentCodeFieldName = props.fieldNames?.departmentCode || "departmentCode";
  const issuedByFieldName = props.fieldNames?.issuedBy || "issuedBy";

  const propsDisabled = (get: ValuesGetter): { disabled?: boolean } => {
    let value: boolean;

    if (typeof (props.disabled) === "function") {
      value = props.disabled(get);
    } else {
      value = props.disabled;
    }

    return typeof (value) === "boolean" ? {disabled: value} : {};
  };

  const docTypeItem: IBaseFormItemLayout = {
    title: "Тип документа",
    fieldName: docTypeIdFieldName,
    mapFormValuesToRequired: (): boolean => trueIfEmpty(props.required),
    mapFormValuesToInputNodeProps: (get: ValuesGetter): Partial<IDulTypeSelectorProps> => props.disableDocTypeSelect ? {disabled: true} : propsDisabled(get),
    afterChange: (value, form): void => {
      const docType = getDocTypeById(value);

      if (docType) {
        form.setFieldsValues({
          [seriesFieldName]: docType.seriesRegex ? form.getFieldValue(seriesFieldName) : undefined,
          [numberFieldName]: docType.numberRegex ? form.getFieldValue(numberFieldName) : undefined,
          [departmentCodeFieldName]: form.getFieldValue(departmentCodeFieldName),
          [issuedByFieldName]: form.getFieldValue(issuedByFieldName)
        });
      } else {
        form.setFieldsValues({
          [seriesFieldName]: undefined,
          [numberFieldName]: undefined,
          [dateFieldName]: undefined,
          [departmentCodeFieldName]: undefined,
          [issuedByFieldName]: undefined
        });
      }
    },
    inputNode: (
      <DulTypeSelector
        allowClear={!trueIfEmpty(props.required)}
      />
    )
  };

  const seriesItem: IBaseFormItemLayout = {
    title: "Серия",
    fieldName: seriesFieldName,
    mapFormValuesToRequired: (get: ValuesGetter): boolean => {
      const docTypeId: Nullable<string> = get([docTypeIdFieldName])?.[docTypeIdFieldName];
      const docType = getDocTypeById(docTypeId);
      // Есть тип, но нету регулярки (для регулярки отдельный валидатор)
      return !!docType && !docType.seriesRegex;
    },
    mapFormValuesToInputNodeProps: (get: ValuesGetter): Partial<CustomInputWithRegexProps> => {
      const docTypeId: Nullable<string> = get([docTypeIdFieldName])?.[docTypeIdFieldName];
      const docType = getDocTypeById(docTypeId);
      return docType
        ? {
          regex: docType.seriesRegex,
          desc: docType.seriesRegexDesc,
          ...propsDisabled(get)
        }
        : {disabled: true};
    },
    rules: [{validator: CustomInputWithRegex.stringWithErrorValidator}],
    inputNode: (
      <CustomInputWithRegex
        checkDisabled={props.checkDisabled}
      />
    )
  };

  const numberItem: IBaseFormItemLayout = {
    title: "Номер",
    fieldName: numberFieldName,
    mapFormValuesToRequired: (get: ValuesGetter): boolean => {
      const docTypeId: Nullable<string> = get([docTypeIdFieldName])?.[docTypeIdFieldName];
      const docType = getDocTypeById(docTypeId);
      // Есть тип, но нету регулярки (для регулярки отдельный валидатор)
      return !!docType && !docType.numberRegex;
    },
    mapFormValuesToInputNodeProps: (get: ValuesGetter): Partial<CustomInputWithRegexProps> => {
      const docTypeId: Nullable<string> = get([docTypeIdFieldName])?.[docTypeIdFieldName];
      const docType = getDocTypeById(docTypeId);
      return docType
        ? {
          regex: docType.numberRegex,
          desc: docType.numberRegexDesc,
          ...propsDisabled(get)
        }
        : {disabled: true};
    },
    rules: [{validator: CustomInputWithRegex.stringWithErrorValidator}],
    inputNode: (
      <CustomInputWithRegex
        checkDisabled={props.checkDisabled}
      />
    )
  };

  const dateItem: IBaseFormItemLayout = {
    title: "Дата выдачи",
    fieldName: dateFieldName,
    mapFormValuesToRequired: (get: ValuesGetter): boolean => {
      const docTypeId: Nullable<string> = get([docTypeIdFieldName])?.[docTypeIdFieldName];
      return props.required ?? !!docTypeId;
    },
    mapFormValuesToInputNodeProps: (get: ValuesGetter): Partial<IStringValueDatePickerProps> => {
      const docTypeId: Nullable<string> = get([docTypeIdFieldName])?.[docTypeIdFieldName];

      if (!docTypeId) {
        return {disabled: true};
      }

      const birthday = typeof (props.birthday) === "function" ? props.birthday(get) : props.birthday;

      return {
        ...getIssuedDateDisabler(docTypeId, birthday),
        ...propsDisabled(get)
      };
    },
    inputNode: (
      <StringValueDatePicker
        locale={datePickerLocaleRu as any}
        format={MomentFormat.DATE_PICKER_FORMATS}
      />
    ),
  };

  const departmentCodeItem: IBaseFormItemLayout = {
    title: "Код подразделения",
    fieldName: departmentCodeFieldName,
    rules: [
      {
        validator: (rule, value, callback): void => {
          if (!value) {
            callback("");
            return;
          }

          if (RegExp(DEPARTMENT_CODE_REGEX).test(value)) {
            callback("")
            return;
          }

          callback(DEPARTMENT_CODE_DESC);
        }
      }
    ],
    // rules: [{pattern: DEPARTMENT_CODE_REGEX,  message: DEPARTMENT_CODE_DESC}],
    inputNode: <SUIDepartmentCodeInput mask={departmentCodeMask}/>
  };

  const issuedByItem: IBaseFormItemLayout = {
    title: "Кем выдан",
    fieldName: issuedByFieldName,
    mapFormValuesToInputNodeProps: (get: ValuesGetter): CustomInputWithRegexProps => {
      return {regex: issuedByRegex, desc: issuedByDesc, ...propsDisabled(get)};
    },
    rules: [{validator: CustomInputWithRegex.stringWithErrorValidator}],
    inputNode: (
      <CustomInputWithRegex
        checkDisabled={props.checkDisabled}
      />
    )
  };

  const layoutParams: IDulCardLayoutParams = {
    docTypeItem,
    seriesItem,
    numberItem,
    dateItem,
    departmentCodeItem,
    issuedByItem
  };

  if (typeof (props.layout) === "function") {
    return props.layout(layoutParams);
  }

  if (props.layout === "narrow") {
    return narrowDulCardLayout(layoutParams);
  }

  return defaultDulCardLayout(layoutParams);
}

export function getDocTypeById(docTypeId: Nullable<string>): IallDocTypes | null {
  return docTypeId && DulService.allDocTypes().find(ridt => ridt.id === docTypeId) || null;
}

function trueIfEmpty(value: boolean): boolean {
  return value !== false;
}

function getIssuedDateDisabler(docTypeId: string, birthday: Nullable<string>): IObjectWithIndex {
  const docType = getDocTypeById(docTypeId);
  return docType && birthday
    ? {disabledDate: dateDisabledForIssueDate(docType.docCode, moment(birthday))}
    : {disabled: true};
}

function defaultDulCardLayout<T>(params: IDulCardLayoutParams): Array<IBaseCardRowLayout<T, IBaseFormItemLayout>> {
  return [
    {
      cols: [
        {
          items: [
            params.docTypeItem,
            params.dateItem,
          ]
        },
        {
          items: [
            params.seriesItem,
            params.departmentCodeItem,
          ]
        },
        {
          items: [
            params.numberItem,
            params.issuedByItem,
          ]
        },
      ]
    }
  ];
}

function narrowDulCardLayout<T>(params: IDulCardLayoutParams): Array<IBaseCardRowLayout<T, IBaseFormItemLayout>> {
  return [
    {
      cols: {
        items: params.docTypeItem
      }
    },
    {
      cols: [
        {
          items: params.seriesItem
        },
        {
          items: params.numberItem
        }
      ]
    },
    {
      cols: [
        {
          items: params.dateItem
        },
        {
          items: params.departmentCodeItem
        }
      ]
    },
    {
      cols: {
        items: params.issuedByItem
      }
    }
  ];
}

interface IStringValueDatePickerProps extends Omit<DatePickerProps, "picker" | "defaultValue" | "value" | "onChange"> {
  value?: Nullable<string>;

  onChange?(value: Nullable<string>): void;
}

function StringValueDatePicker(props: IStringValueDatePickerProps): JSX.Element {
  const {value, onChange, ...restPickerProps} = props;

  const newOnChange = (newValue: Nullable<Moment>): void => {
    if (onChange) {
      onChange(newValue?.format(moment.HTML5_FMT.DATE) ?? null);
    }
  };

  return (
    <DatePicker
      {...restPickerProps}
      picker="date"
      value={value ? moment(value) : undefined}
      onChange={newOnChange}
    />
  )
}

