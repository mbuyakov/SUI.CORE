import {Observable, SUIReactComponent} from "@smsoft/sui-all";
import React from "react";

export interface IObservableBinderProps<T> {
  observable: Observable<T>
  children(value: T): React.ReactNode
}

export default class ObservableBinder<T> extends SUIReactComponent<IObservableBinderProps<T>, {
  value: T
}> {
  public constructor(props: IObservableBinderProps<T>) {
    super(props);
    this.state = {
      value: props.observable.getValue()
    } ;
    this.registerObservableHandler(props.observable.subscribe(value => this.setState({value})));
  }

  public render(): React.ReactNode {
    return this.props.children(this.state.value);
  }
}
