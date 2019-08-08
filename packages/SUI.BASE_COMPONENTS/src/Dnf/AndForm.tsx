import * as React from 'react';

import { DnfForm } from './DnfForm';
import { ICommonDnfProps, IResultAndFormValues, IResultDnfFormValues } from './ICommonDnfProps';

interface IAndFormProps<T> {
  initialState?: IResultAndFormValues<T>;

  // tslint:disable-next-line:no-any
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
          // tslint:disable-next-line:no-any
          forms: (forms ? [forms] : undefined) as any,
        }}
        defaultSubmitButtonTitle={this.props.defaultSubmitButtonTitle || 'Создать'}
        orBehaviorDisabled={true}
        orElementValidator={this.props.dnfValidator}
        valuesMapper={AndForm.valuesMapper}
      />
    );
  }

}
