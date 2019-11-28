import { Popconfirm } from 'antd';
import { PopconfirmProps } from 'antd/lib/popconfirm';
import autobind from 'autobind-decorator';
import * as React from 'react';

import {IPromisedErrorPopoverProps, PromisedErrorPopover} from './PromisedErrorPopover';

export interface IPromisedBaseProps<V> {
  errorPopoverProps: Omit<IPromisedErrorPopoverProps, "promise">;
  popconfirmSettings?: PopconfirmSettings | boolean;

  // Must be function to generate new promise on each change
  promise(value: V): Promise<void>;
}

export interface IPromisedBaseState<V> {
  loading?: boolean;
  popconfirmVisible?: boolean;
  promise?: Promise<void>;
  savedValue?: V;
  value?: V;
}

type PopconfirmSettings = Omit<PopconfirmProps, 'onConfirm' | 'onCancel'>;

export abstract class PromisedBase<P, S extends IPromisedBaseState<V>, V> extends React.Component<IPromisedBaseProps<V> & P, S> {
  public constructor(props: IPromisedBaseProps<V> & P) {
    super(props);
    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    this.state = {};
  }

  @autobind
  public save(value?: V): void {
    if (this.state.loading) {
      return;
    }

    if (this.props.popconfirmSettings) {
      // tslint:disable-next-line:strict-type-predicates
      this.setState({ popconfirmVisible: true, value: (value == null ? this.state.value : value) });
    } else {
      this.onConfirm(value);
    }
  }

  @autobind
  public saveWithoutValue(): void {
    // Workaround for button handler
    this.save();
  }

  @autobind
  protected onCancel(): void {
    this.setState({ popconfirmVisible: false });
  }

  @autobind
  protected onChange(value: V): void {
    this.setState({ value });
  }

  protected wrapConfirmAndError(child: JSX.Element | null): JSX.Element {
    const childWithErrorPopover = <PromisedErrorPopover {...this.props.errorPopoverProps} promise={this.state.promise}>{child}</PromisedErrorPopover>;

    return this.props.popconfirmSettings ? (
      <Popconfirm
        {...(typeof this.props.popconfirmSettings === 'boolean' ? { title: 'Вы уверены?' } : (this.props.popconfirmSettings as PopconfirmSettings))}
        visible={this.state.popconfirmVisible}
        onConfirm={this.onConfirmWithoutValue}
        onCancel={this.onCancel}
      >
        {childWithErrorPopover}
      </Popconfirm>
    ) : (
      childWithErrorPopover
    );
  }

  @autobind
  private onConfirm(value?: V): void {
    // tslint:disable-next-line:triple-equals
    const promise = this.props
      .promise(value == null ? this.state.value : value)
      .then(_ => {
        // tslint:disable-next-line:triple-equals
        this.setState({ loading: false, savedValue: (value == null ? this.state.value : value) });
      })
      .catch(reason => {
        this.setState({ loading: false });
        throw reason;
      });
    this.setState({ promise, loading: true, popconfirmVisible: false });
  }

  @autobind
  private onConfirmWithoutValue(): void {
    // Workaround for button handler
    this.onConfirm();
  }
}
