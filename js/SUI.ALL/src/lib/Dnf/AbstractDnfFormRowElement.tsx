import autobind from "autobind-decorator";
import * as React from "react";

import { IObjectWithIndex } from '../other';

import {IDnfFormRowElementProps} from "./ICommonDnfProps";

// tslint:disable-next-line:no-any
export abstract class AbstractDnfFormRowElement<T = any, TProps = {}, TState = {}>
  extends React.Component<IDnfFormRowElementProps<T> & TProps, TState> {

  @autobind
  protected getDecoratorName(fieldName: string): string {
    return `${this.getElementName()}.${fieldName}`;
  }

  @autobind
  protected getElementName(): string {
    return `elements[${this.props.id as unknown as string}]`;
  }

  @autobind
  // tslint:disable-next-line:no-any
  protected getFieldValue(field: string): any {
    return this.props.form.getFieldValue(this.getDecoratorName(field));
  }

  @autobind
  protected resetFields(name: string | string[]): void {
    this.props.form.resetFields((Array.isArray(name) ? name : [name]).map(this.getDecoratorName));
  }

  @autobind
  // tslint:disable-next-line:no-any
  protected setField(name: string, value: any): void {
    const newValue: IObjectWithIndex = {};
    newValue[this.getDecoratorName(name)] = value;
    this.props.form.setFieldsValue({newValue});
  }

}
