import {CustomInputWithRegex, CustomInputWithRegexProps} from "@/Inputs/CustomInputWithRegex";
import {DatePicker} from "antd";
import locale from "antd/es/date-picker/locale/ru_RU";
import {Rules} from "async-validator";
import autobind from "autobind-decorator";
import {isEqual} from "lodash";
import moment, {Moment} from 'moment';
import * as React from 'react';
import {BaseFormProps} from "@/MutableBackendTable";
import {DEPARTMENT_CODE_DESC, DEPARTMENT_CODE_REGEX, disableDocDate, formatRawForGraphQL, IObjectWithIndex, OneOrArrayWithNulls} from "@sui/core";
import {BaseForm, IBaseCardRowLayout, IBaseFormItemLayout, ValuesGetter} from "@/Base";
import {DulService, IallDocTypes} from "@/soctech/DulService";
import {DulTypeSelector} from "@/Inputs";
import {BASE_FORM_CLASS} from "@/styles";
import {Observable, ObservableHandler, ObservableHandlerStub} from "@/Observable";
import {StringWithError} from "@/utils";


export const RUSSIAN_PASSPORT_DOC_CODE = 21;
export const issuedByRegex = "^[0-9А-Яа-я\\s№.\\-\"\']{1,250}$";
export const issuedByDesc = "Разрешены русские буквы, цифры и символы №.-\"\' до 250 знаков";


export interface IDulFields {
  date?: Moment;
  departmentCode?: string;
  docTypeId?: string;
  issuedBy?: string;
  number?: string;
  series?: string;
}


export interface IDulValues {
  date: string;
  departmentCode: string;
  docTypeId: string;
  issuedBy: string;
  number: string;
  personId: string;
  series: string;
}

export interface IDulCardOptions {
  birthday?: string;
  disabled?: boolean;
  isEdit?: boolean;
  personAge?: number;
  required?: boolean;
  uuid?: string;
}

export interface IDulCardProps extends IDulCardOptions {
  value?: IDulFields;

  onChange?(value: IDulFields): void;

  onErrorCheck?(hasError: boolean): void;
}

export interface IDulCardState {
  initFormProps: BaseFormProps<any>,
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<any, IBaseFormItemLayout>>,
}

const DATE_FORMATS = ['DD.MM.YYYY', 'DDMMYYYY', 'DDMMYY'];


export class DulCard extends React.Component<IDulCardProps, IDulCardState> {

  private static propsMap: Map<string, IDulCardProps> = new Map<string, IDulCardProps>();

  public static allFieldsFilledValidator = (rule: Rules, value: IDulFields, cb: (error: string | string[]) => void): void => {
    const notFulfilled = Object.values(value).some(v =>
      v === null || v === undefined || StringWithError.isPacked(v)
    );
    cb(notFulfilled ? "  " : "");
  };

  public static formValuesToChangeDul(personId: string, values: IDulFields): IDulValues {
    return ({
      date: values.date?.format(moment.HTML5_FMT.DATE),
      departmentCode: values.departmentCode,
      docTypeId: values.docTypeId,
      issuedBy: formatRawForGraphQL(values.issuedBy),
      number: values.number,
      personId,
      series: values.series
    });
  }

  public static getDocTypeById(docTypeId?: string): IallDocTypes {
    return docTypeId && DulCard.allDocTypes.find(ridt => ridt.id === docTypeId) || null;
  }

  public static getDulFormProps(dulCardProps: IDulCardProps): BaseFormProps<any> {
    return ({
      ...DulCard.getInitDulFormProps(dulCardProps),
      rows: DulCard.getDulFormRows(dulCardProps),
    });
  }

  public static trueIfEmpty(required: boolean): boolean {
    return required !== false;
  }

  public static getDulFormRows(dulCardProps: Readonly<IDulCardProps>): OneOrArrayWithNulls<IBaseCardRowLayout<any, IBaseFormItemLayout>> {
    const dulCardUuid = dulCardProps.uuid || "main";
    DulCard.propsMap.set(dulCardUuid, dulCardProps);

    return [
      {
        cols: [
          {
            items: [
              {
                title: 'Тип документа',
                fieldName: 'docTypeId',
                required: DulCard.trueIfEmpty(dulCardProps.required),
                mapFormValuesToInputNodeProps: (_: ValuesGetter): any => {
                  const props = DulCard.propsMap.get(dulCardUuid);
                  return {
                    disabled: props.isEdit || props.disabled,
                  };
                },
                inputNode: <DulTypeSelector/>
              },
              {
                title: 'Дата выдачи',
                fieldName: 'date',
                required: DulCard.trueIfEmpty(dulCardProps.required),
                mapFormValuesToInputNodeProps: (get: ValuesGetter): any => {
                  const {docTypeId} = get(["docTypeId"]);
                  const props = DulCard.propsMap.get(dulCardUuid);
                  const res = DulCard.getIssuedDateDisabler(docTypeId, props.birthday, props.personAge)
                  res.disabled = props.disabled;
                  return res;
                },
                inputNode: (<DatePicker locale={locale as any} format={DATE_FORMATS}/>),
              },
            ]
          },
          {
            items: [
              {
                title: 'Серия',
                fieldName: 'series',
                mapFormValuesToRequired: (get: ValuesGetter): boolean => {
                  const values: { docTypeId?: string } = get(["docTypeId"]);
                  const docType = DulCard.getDocTypeById(values.docTypeId);
                  return !!docType && (!docType?.seriesRegex || docType?.seriesRegex == "");
                },
                inputNode: <CustomInputWithRegex/>,
                rules: [{validator: CustomInputWithRegex.enchantedValueValidator}],
                mapFormValuesToInputNodeProps: (get: ValuesGetter): CustomInputWithRegexProps => {
                  const values: { docTypeId?: string } = get(["docTypeId"]);
                  const props = DulCard.propsMap.get(dulCardUuid);
                  const docType = DulCard.getDocTypeById(values.docTypeId);
                  return docType
                    ? {
                      regex: docType.seriesRegex,
                      desc: docType.seriesRegexDesc,
                      disabled: props.disabled,
                    }
                    : {disabled: true};
                }
              },
              {
                title: 'Код подразделения',
                fieldName: 'departmentCode',
                inputNode: <CustomInputWithRegex/>,
                rules: [{validator: CustomInputWithRegex.enchantedValueValidator}],
                mapFormValuesToInputNodeProps: (get: ValuesGetter): CustomInputWithRegexProps => {
                  const values: { docTypeId?: string } = get(["docTypeId"]);
                  const props = DulCard.propsMap.get(dulCardUuid);
                  return DulCard.isRussianDocType(values.docTypeId)
                    ? {
                      regex: DEPARTMENT_CODE_REGEX,
                      desc: DEPARTMENT_CODE_DESC,
                      disabled: props.disabled,
                    }
                    : {disabled: true};
                }
              },
            ]
          },
          {
            items: [
              {
                title: 'Номер',
                fieldName: 'number',
                inputNode: <CustomInputWithRegex/>,
                rules: [{validator: CustomInputWithRegex.enchantedValueValidator}],
                mapFormValuesToRequired: (get: ValuesGetter): boolean => {
                  const values: { docTypeId?: string } = get(["docTypeId"]);
                  const docType = DulCard.getDocTypeById(values.docTypeId);
                  return !!docType && (!docType?.numberRegex || docType?.numberRegex == "");
                },
                mapFormValuesToInputNodeProps: (get: ValuesGetter): CustomInputWithRegexProps => {
                  const values: { docTypeId?: string } = get(["docTypeId"]);
                  const props = DulCard.propsMap.get(dulCardUuid);
                  const docType = DulCard.getDocTypeById(values.docTypeId);
                  return docType
                    ? {
                      regex: docType.numberRegex,
                      desc: docType.numberRegexDesc,
                      disabled: props.disabled,
                    }
                    : {disabled: true};
                }
              },
              {
                title: 'Кем выдан',
                fieldName: 'issuedBy',
                inputNode: <CustomInputWithRegex/>,
                rules: [{validator: CustomInputWithRegex.enchantedValueValidator}],
                mapFormValuesToInputNodeProps: (get: ValuesGetter): CustomInputWithRegexProps => {
                  const values: { docTypeId?: string } = get(["docTypeId"]);
                  const props = DulCard.propsMap.get(dulCardUuid);
                  return DulCard.isRussianDocType(values.docTypeId)
                    ? {
                      regex: issuedByRegex,
                      desc: issuedByDesc,
                      disabled: props.disabled,
                    }
                    : {disabled: true};
                }
              },
            ]
          },
        ]
      }
    ];
  }

  public static getInitDulFormProps(dulCardProps: Readonly<IDulCardProps>): BaseFormProps<any> {
    const editSuffix = dulCardProps.isEdit ? 'edit' : 'create';
    const uuidSuffix = dulCardProps.uuid && typeof dulCardProps.uuid === 'string' && dulCardProps.uuid.length > 0
      ? `-${dulCardProps.uuid}` : '';
    return ({
      uuid: `iddoc-${editSuffix}-form${uuidSuffix}`,
      momentFields: ["date"],
      initialValues: dulCardProps.value || {docTypeId: ''},
      verticalLabel: true,
      noCard: true,
      cardStyle: {padding: 0},
      className: BASE_FORM_CLASS,
    });
  }

  public static getIssuedDateDisabler(docTypeId: string, birthday: string, personAge: number): IObjectWithIndex {
    const docType = DulCard.getDocTypeById(docTypeId);
    return docTypeId
      ? {
        disabledDate: ((current: Moment): boolean => disableDocDate(docType.docCode, birthday, personAge, current))
      }
      : {disabled: true};
  }

  public static isRussianDocType(docTypeId: string): boolean {
    return docTypeId && DulCard.getDocTypeById(docTypeId)?.docCode === RUSSIAN_PASSPORT_DOC_CODE || false;
  }

  private static dulCardOptionsIsNotEqual(options1: IDulCardOptions, options2: IDulCardOptions): boolean {
    return options1.personAge !== options2.personAge
      || options1.birthday !== options2.birthday
      || options1.required !== options2.required
      || options1.isEdit !== options2.isEdit
      || options1.disabled !== options2.disabled;
  }

  private static readonly allDocTypes: IallDocTypes[] = DulService.allDocTypes();

  private fieldsHandlers: ObservableHandlerStub[] = null;

  public constructor(props: Readonly<IDulCardProps>) {
    super(props);
    this.state = {
      initFormProps: DulCard.getInitDulFormProps(props),
      rows: DulCard.getDulFormRows(props),
    };
  }

  public componentDidUpdate(prevProps: Readonly<IDulCardProps>, prevState: Readonly<IDulCardState>): void {
    if (DulCard.dulCardOptionsIsNotEqual(prevProps, this.props)) {
      this.setState({
        rows: DulCard.getDulFormRows(this.props)
      });
    }
    if (!isEqual(prevProps.value, this.props.value)) {
      this.setState({initFormProps: DulCard.getInitDulFormProps(this.props)});
    }
  }

  public componentWillUnmount(): void {
    this.fieldsHandlers?.forEach(handler => handler.unsubscribe());
  }

  public render(): JSX.Element {
    return (
      <BaseForm
        {...this.state?.initFormProps}
        onInitialized={this.onInitializedForm}
        onSubmit={this.onSubmit}
        rows={this.state?.rows}
      />
    );
  }

  @autobind
  private getOnFieldChange(form: BaseForm): ObservableHandler<any> {
    return (newValue: any, oldValue?: any): void => this.props?.onChange(form.getFieldsValue());
  }

  @autobind
  private getOnFieldErrorChange(form: BaseForm): ObservableHandler<any> {
    return (newValue: any, oldValue?: any): void => {
      const errors = Object.values(form.getFieldsError())
        .map((error: Observable<string>): string => error.getValue());
      const hasError = errors.some(error => !!error);
      this.props?.onErrorCheck(hasError);
    }
  }

  @autobind
  private onInitializedForm(form: BaseForm): void {
    if (DulCard.trueIfEmpty(this.props.required)
        && (!!this.props.onChange || !!this.props.onErrorCheck)) {
      const fields = form.getFormFields();
      this.fieldsHandlers = fields.flatMap(field => [
        field.value.subscribe(this.getOnFieldChange(form)),
        field.error.subscribe(this.getOnFieldErrorChange(form)),
      ]);
    }
  }

  @autobind
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onSubmit(value: IDulFields): Promise<boolean> {
    // Stub function
    return Promise.resolve(true);
  }
}
