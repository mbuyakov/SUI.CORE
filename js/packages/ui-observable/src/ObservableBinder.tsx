import React from "react";
import {Observable} from "./Observable";
import {ObservableHandlerStub} from "./types";

export interface IObservableBinderProps<T> {
  observable: Observable<T>

  children(value: T): React.ReactNode
}

export class ObservableBinder<T> extends React.Component<IObservableBinderProps<T>, {
  value: T
}> {
  private handler: ObservableHandlerStub;

  public constructor(props: IObservableBinderProps<T>) {
    super(props);
    this.state = {
      value: props.observable.getValue()
    };
    this.handler = props.observable.subscribe(value => this.setState({value}));
  }

  public render(): React.ReactNode {
    return this.props.children(this.state.value);
  }

  public componentWillUnmount() {
    this.handler?.unsubscribe();
  }
}
