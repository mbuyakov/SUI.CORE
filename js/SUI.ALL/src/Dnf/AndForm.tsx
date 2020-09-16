import * as React from 'react';

import { DnfForm } from './DnfForm';
import { ICommonDnfProps, IResultAndFormValues, IResultDnfFormValues } from './ICommonDnfProps';

interface IAndFormProps<T> {
  cardStyle?: React.CSSProperties;
  initialState?: IResultAndFormValues<T>;

dnfValidator?(value: T[], callback: any): void;
}

export class AndForm<TElement>
  extends React.Component<ICommonDnfProps<IResultAndFormValues<TElement>> & IAndFormProps<TElement>> {

  private static valuesMapper<T>(values: IResultDnfFormValues<T>): IResultAndFormValues<T> {
    return {
      ...values,
      forms: values && values.forms && values.forms[0],
    };
  }

  public render(): JSX.Element {
    const forms: TElement[] | undefined = this.props.initialState && this.props.initialState.forms;

    return (
      <DnfForm
        {...this.props}
        initialState={{
          ...this.props.initialState,
forms: (forms ? [forms] : undefined) as any,
        }}
        defaultSubmitButtonTitle={this.props.defaultSubmitButtonTitle || 'Создать'}
        orBehaviorDisabled={true}
        orElementValidator={this.props.dnfValidator}
        valuesMapper={AndForm.valuesMapper}
        andCardStyle={this.props.cardStyle}
      />
    );
  }

}
