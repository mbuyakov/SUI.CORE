import {Omit, SUI_ROW_GROW_LEFT} from "@smsoft/sui-core";
import {Button} from "antd";
import Select, {SelectProps} from "antd/lib/select";
import * as React from "react";

import {IPromisedBaseProps, IPromisedBaseState, PromisedBase} from "./PromisedBase";

export type PromisedSelectProps<T> = IPromisedBaseProps<T> & Omit<SelectProps<T>, "onChange" | "value">

export class PromisedSelect<T> extends PromisedBase<PromisedSelectProps<T>, IPromisedBaseState<T>, T> {
  public constructor(props: PromisedSelectProps<T>) {
    super(props);
    this.state = {
      savedValue: this.props.defaultValue,
      value: this.props.defaultValue,
    };
  }

  public render(): JSX.Element {
    const {promise, popconfirmSettings, ...selectProps} = this.props;
    const saveButton: JSX.Element = this.wrapConfirmAndError(<Button type="primary" icon={this.state.loading ? "loading" : "save"} disabled={this.state.loading} onClick={this.saveWithoutValue}/>);

    return (
      <div className={SUI_ROW_GROW_LEFT}>
        <Select<T>
          // Typescript goes crazy. Mark as any to ignore
          // tslint:disable-next-line:no-any
          {...selectProps as SelectProps<T> as any}
          disabled={this.props.disabled || this.props.loading || this.state.loading || false}
          onChange={this.onChange}
          value={this.state.value as T}
        />
        {this.state.savedValue !== this.state.value && saveButton}
      </div>
    );
  }
}
