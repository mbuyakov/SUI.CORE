import {WrappedFormUtils} from "antd/lib/form/Form";
import * as React from "react";

export interface IDnfFormRowElementProps<T = {}> {
  form: WrappedFormUtils;
  id: number;
  initialValues?: T;
}

export interface IFormItemWrapperProps {
  formItems: React.ReactNode;
  // tslint:disable-next-line:no-any
  formValues: { [field: string]: any };
  hasErrors?: boolean;
  loading?: boolean;
}

export interface ISupportingWrapperFormProps {
  formItemsWrapper?(props: IFormItemWrapperProps): JSX.Element;
}

export interface ICommonDnfProps<V> extends ISupportingWrapperFormProps {
  addConjunctionButtonTitle?: string;
  defaultSubmitButtonTitle?: string;
  disableAndFormBorder?: boolean;
  disableDefaultSubmitButton?: boolean;
  disableRowSwap?: boolean;
  loading?: boolean;
  withDivider?: boolean;
  wrapperStyle?: React.CSSProperties;

  additionalFormItems?(form: WrappedFormUtils): JSX.Element;

  onChange?(values: V, hasErrors: boolean): void;

  onSubmit?(values: V): void;

  rowComponent(props: IDnfFormRowElementProps): React.ReactElement<IDnfFormRowElementProps>;
}

export interface IClearDnfFromValues {
  // tslint:disable-next-line:no-any
  [field: string]: any;
}

export interface IResultDnfFormValues<TElements> extends IClearDnfFromValues {
  forms: TElements[][];
}

export interface IResultAndFormValues<TElements> extends IClearDnfFromValues {
  forms: TElements[];
}
