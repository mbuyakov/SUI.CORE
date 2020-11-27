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


export interface IAddDulValues {
  date: string;
  departmentCode: string;
  docTypeId: string;
  issuedBy: string;
  number: string;
  personId: string;
  series: string;
}

export interface IAddDulCardProps {
  birthday?: string;
  personAge?: number;
  value?: IDulFields;

  onChange?(value: IDulFields): void;

  onErrorCheck?(hasError: boolean): void;
}

export interface IAddDulCardState {
  initFormProps: BaseFormProps<any>,
  rows: OneOrArrayWithNulls<IBaseCardRowLayout<any, IBaseFormItemLayout>>,
}

const DATE_FORMATS = ['DD.MM.YYYY', 'DDMMYYYY', 'DDMMYY'];


export class AddDulCard extends React.Component<IAddDulCardProps, IAddDulCardState> {

  public static allFieldsFilledValidator = (rule: Rules, value: IDulFields, cb: (error: string | string[]) => void): void => {
    const notFulfilled = Object.values(value).some(v =>
      v === null || v === undefined || CustomInputWithRegex.isEnchanted(v)
    );
    cb(notFulfilled ? "  " : "");
  };

  public static formValuesToAddDul(personId: string, values: IDulFields): IAddDulValues {
    return ({
      date: values.date.format(moment.HTML5_FMT.DATE),
      departmentCode: values.departmentCode,
      docTypeId: values.docTypeId,
      issuedBy: formatRawForGraphQL(values.issuedBy),
      number: values.number,
      personId,
      series: values.series
    });
  }

  public static getDocTypeById(docTypeId?: string): IallDocTypes {
    return docTypeId && AddDulCard.allDocTypes.find(ridt => ridt.id === docTypeId) || null;
  }

  public static getDulFormProps(value: IDulFields, birthday: string, personAge: number, isEdit: boolean): BaseFormProps<any> {
    return ({
      ...AddDulCard.getInitDulFormProps(value, birthday, personAge, isEdit),
      rows: AddDulCard.getDulFormRows(birthday, personAge, isEdit),
    });
  }

  public static getDulFormRows(birthday: string, personAge: number, isEdit: boolean): OneOrArrayWithNulls<IBaseCardRowLayout<any, IBaseFormItemLayout>> {
    // TODO: strange thing, birthday and personAge are undefined in mapFormValuesToInputNodeProps
    AddDulCard.birthday = birthday;
    AddDulCard.personAge = personAge;

    return [
      {
        cols: [
          {
            items: [
              {
                title: 'Тип документа',
                required: true,
                fieldName: 'docTypeId',
                inputNode: <DulTypeSelector disabled={isEdit}/>
              },
              {
                title: 'Дата выдачи',
                fieldName: 'date',
                required: true,
                mapFormValuesToInputNodeProps: (get: ValuesGetter): any => {
                  const {docTypeId} = get(["docTypeId"]);
                  return AddDulCard.getIssuedDateDisabler(docTypeId, AddDulCard.birthday, AddDulCard.personAge);
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
                  return !!values.docTypeId
                },
                inputNode: <CustomInputWithRegex/>,
                rules: [{validator: CustomInputWithRegex.enchantedValueValidator}],
                mapFormValuesToInputNodeProps: (get: ValuesGetter): CustomInputWithRegexProps => {
                  const values: { docTypeId?: string } = get(["docTypeId"]);
                  const docType = AddDulCard.getDocTypeById(values.docTypeId);
                  return docType
                    ? {
                      regex: docType.seriesRegex,
                      desc: docType.seriesRegexDesc
                    }
                    : {disabled: true};
                }
              },
              {
                title: 'Код подразделения',
                fieldName: 'departmentCode',
                inputNode: <CustomInputWithRegex/>,
                rules: [{validator: CustomInputWithRegex.enchantedValueValidator}],
                mapFormValuesToRequired: (get: ValuesGetter): boolean => {
                  const values: { docTypeId?: string } = get(["docTypeId"]);
                  return AddDulCard.isRussianDocType(values.docTypeId)
                },
                mapFormValuesToInputNodeProps: (get: ValuesGetter): CustomInputWithRegexProps => {
                  const values: { docTypeId?: string } = get(["docTypeId"]);
                  return AddDulCard.isRussianDocType(values.docTypeId)
                    ? {
                      regex: DEPARTMENT_CODE_REGEX,
                      desc: DEPARTMENT_CODE_DESC,
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
                  return !!values.docTypeId
                },
                mapFormValuesToInputNodeProps: (get: ValuesGetter): CustomInputWithRegexProps => {
                  const values: { docTypeId?: string } = get(["docTypeId"]);
                  const docType = AddDulCard.getDocTypeById(values.docTypeId);
                  return docType
                    ? {
                      regex: docType.numberRegex,
                      desc: docType.numberRegexDesc
                    }
                    : {disabled: true};
                }
              },
              {
                title: 'Кем выдан',
                fieldName: 'issuedBy',
                inputNode: <CustomInputWithRegex/>,
                rules: [{validator: CustomInputWithRegex.enchantedValueValidator}],
                mapFormValuesToRequired: (get: ValuesGetter): boolean => {
                  const values: { docTypeId?: string } = get(["docTypeId"]);
                  return AddDulCard.isRussianDocType(values.docTypeId)
                },
                mapFormValuesToInputNodeProps: (get: ValuesGetter): CustomInputWithRegexProps => {
                  const values: { docTypeId?: string } = get(["docTypeId"]);
                  return AddDulCard.isRussianDocType(values.docTypeId)
                    ? {
                      regex: issuedByRegex,
                      desc: issuedByDesc,
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

  public static getInitDulFormProps(value: IDulFields, birthday: string, personAge: number, isEdit: boolean): BaseFormProps<any> {
    return ({
      uuid: `iddoc-${isEdit ? 'edit' : 'create'}-form`,
      momentFields: ["date"],
      initialValues: value || {docTypeId: ''},
      verticalLabel: true,
      noCard: true,
      cardStyle: {padding: 0},
      className: BASE_FORM_CLASS,
    });
  }

  public static getIssuedDateDisabler(docTypeId: string, birthday: string, personAge: number): IObjectWithIndex {
    const docType = AddDulCard.getDocTypeById(docTypeId);
    return docTypeId
      ? {
        disabledDate: ((current: Moment): boolean => disableDocDate(docType.docCode, birthday, personAge, current))
      }
      : {disabled: true};
  }

  public static isRussianDocType(docTypeId: string): boolean {
    return docTypeId && AddDulCard.getDocTypeById(docTypeId)?.docCode === RUSSIAN_PASSPORT_DOC_CODE || false;
  }

  private static readonly allDocTypes: IallDocTypes[] = DulService.allDocTypes();

  private static birthday: string;
  private static personAge: number;

  private fieldsHandlers: ObservableHandlerStub[] = null;


  public constructor(props: Readonly<IAddDulCardProps>) {
    super(props);
    this.state = {
      initFormProps: AddDulCard.getDulFormProps(props.value, props.birthday, props.personAge, false),
      rows: AddDulCard.getDulFormRows(props.birthday, props.personAge, false),
    };
  }

  public componentDidUpdate(prevProps: Readonly<IAddDulCardProps>, prevState: Readonly<IAddDulCardState>): void {
    if(prevProps.personAge !== this.props.personAge || prevProps.birthday !== this.props.birthday) {
      this.setState({rows: AddDulCard.getDulFormRows(this.props.birthday, this.props.personAge, false)});
    }
    if(!isEqual(prevProps.value, this.props.value)) {
      this.setState({initFormProps: AddDulCard.getInitDulFormProps(this.props.value, this.props.birthday, this.props.personAge, false)});
    }
  }

  public componentWillUnmount(): void {
    this.fieldsHandlers.forEach(handler => handler.unsubscribe());
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
    if (!!this.props.onChange || !!this.props.onErrorCheck) {
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
