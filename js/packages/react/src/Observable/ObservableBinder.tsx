import React from "react";

// noinspection ES6PreferShortImport
import {SUIReactComponent} from '../SUIReactComponent';

import {Observable} from './Observable';

export interface IObservableBinderProps<T> {
  observable: Observable<T>

  children(value: T): React.ReactNode
}

export class ObservableBinder<T> extends SUIReactComponent<IObservableBinderProps<T>, {
  value: T
}> {
  public constructor(props: IObservableBinderProps<T>) {
    super(props);
    this.state = {
      value: props.observable.getValue()
    };
    this.registerObservableHandler(props.observable.subscribe(value => this.setState({value})));
  }

  public render(): React.ReactNode {
    return this.props.children(this.state.value);
  }
}
