import React from "react";
import {Observable} from "./Observable";
import {useObservableValue} from "./hooks";

export interface IObservableBinderProps<T> {
  observable: Observable<T>

  children(value: T): React.ReactNode
}

export const ObservableBinder: <T>(props: IObservableBinderProps<T>) => React.ReactNode = (props) => {
  const value = useObservableValue(props.observable);
  return props.children(value);
};

