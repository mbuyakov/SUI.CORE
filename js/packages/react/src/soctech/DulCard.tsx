/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import locale from "antd/es/date-picker/locale/ru_RU";
import {DEPARTMENT_CODE_DESC, DEPARTMENT_CODE_REGEX, Nullable, disableDocDate, IObjectWithIndex} from "@sui/core";
import moment, {Moment} from "moment";
import {DatePickerProps} from "antd/lib/date-picker";
import {DatePicker} from "antd";
import {IBaseCardRowLayout, IBaseFormItemLayout, ValuesGetter} from "@/Base";
import {CustomInputWithRegex, CustomInputWithRegexProps, DulTypeSelector, IDulTypeSelectorProps} from "@/Inputs";
import {DulService, IallDocTypes} from "@/soctech/DulService";

export const RUSSIAN_PASSPORT_DOC_CODE = 21;
export const issuedByRegex = "^[0-9А-Яа-я\\s№.\\-\"\'()]{1,250}$";
export const issuedByDesc = "Разрешены русские буквы, цифры и символы №.-\"\'() до 250 знаков";

export interface IDulCardFormItemsProps<T = any> {
  birthday?: Nullable<string> | ((get: ValuesGetter) => Nullable<string>);
  checkDisabled?: boolean;
  disabled?: boolean | ((get: ValuesGetter) => boolean);
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

  const propsDisabled = (get: ValuesGetter): boolean => {
    if (typeof (props.disabled) === "function") {
      return props.disabled(get);
    } else {
      return props.disabled || false;
    }
  };

  const docTypeItem = {
    title: "Тип документа",
    fieldName: docTypeIdFieldName,
    mapFormValuesToRequired: (): boolean => trueIfEmpty(props.required),
    mapFormValuesToInputNodeProps: (get: ValuesGetter): Partial<IDulTypeSelectorProps> => ({disabled: propsDisabled(get) || props.disableDocTypeSelect}),
    afterChange: (value, form): void => {
      const docType = getDocTypeById(value);

      if (docType) {
        const isRussianDocTypeValue = isRussianDocType(docType.id);

        form.setFieldsValues({
          [seriesFieldName]: docType.seriesRegex ? form.getFieldValue(seriesFieldName) : undefined,
          [numberFieldName]: docType.numberRegex ? form.getFieldValue(numberFieldName) : undefined,
          [departmentCodeFieldName]: isRussianDocTypeValue ? form.getFieldValue(departmentCodeFieldName) : undefined,
          [issuedByFieldName]: isRussianDocTypeValue ? form.getFieldValue(issuedByFieldName) : undefined
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

  const seriesItem = {
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
          disabled: propsDisabled(get)
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

  const numberItem = {
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
          disabled: propsDisabled(get)
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

  const dateItem = {
    title: "Дата выдачи",
    fieldName: dateFieldName,
    mapFormValuesToRequired: (get: ValuesGetter): boolean => {
      const docTypeId: Nullable<string> = get([docTypeIdFieldName])?.[docTypeIdFieldName];
      return trueIfEmpty(props.required) || !!docTypeId;
    },
    mapFormValuesToInputNodeProps: (get: ValuesGetter): Partial<IStringValueDatePickerProps> => {
      const docTypeId: Nullable<string> = get([docTypeIdFieldName])?.[docTypeIdFieldName];

      if (!docTypeId) {
        return {disabled: true};
      }

      const birthday = typeof (props.birthday) === "function" ? props.birthday(get) : props.birthday;
      const age = birthday ? moment().diff(birthday, "years") : undefined;

      return {
        ...getIssuedDateDisabler(docTypeId, birthday, age),
        disabled: propsDisabled(get)
      };
    },
    inputNode: (
      <StringValueDatePicker
        locale={locale as any}
        format={['DD.MM.YYYY', 'DDMMYYYY', 'DDMMYY']}
      />
    ),
  };

  const departmentCodeItem = {
    title: "Код подразделения",
    fieldName: departmentCodeFieldName,
    mapFormValuesToInputNodeProps: (get: ValuesGetter): CustomInputWithRegexProps => {
      const docTypeId: Nullable<string> = get([docTypeIdFieldName])?.[docTypeIdFieldName];
      return isRussianDocType(docTypeId)
        ? {
          regex: DEPARTMENT_CODE_REGEX,
          desc: DEPARTMENT_CODE_DESC,
          disabled: propsDisabled(get)
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

  const issuedByItem = {
    title: "Кем выдан",
    fieldName: issuedByFieldName,
    mapFormValuesToInputNodeProps: (get: ValuesGetter): CustomInputWithRegexProps => {
      const docTypeId: Nullable<string> = get([docTypeIdFieldName])?.[docTypeIdFieldName];
      return isRussianDocType(docTypeId)
        ? {
          regex: issuedByRegex,
          desc: issuedByDesc,
          disabled: propsDisabled(get)
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

  const layoutParams = {
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

export function isRussianDocType(docTypeId: Nullable<string>): boolean {
  return !!docTypeId && getDocTypeById(docTypeId)?.docCode === RUSSIAN_PASSPORT_DOC_CODE;
}

function trueIfEmpty(value: boolean): boolean {
  return value !== false;
}

function getIssuedDateDisabler(docTypeId: string, birthday: string, personAge: number): IObjectWithIndex {
  const docType = getDocTypeById(docTypeId);
  return docTypeId
    ? {disabledDate: ((current: Moment): boolean => disableDocDate(docType.docCode, birthday, personAge, current))}
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

