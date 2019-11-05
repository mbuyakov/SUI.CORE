import autobind from 'autobind-decorator';
import React from 'react';

import { ObservableHandlerStub } from './Observable';

export class SUIReactComponent<P = {}, S = {}> extends React.Component<P, S> {
  private readonly intervals: NodeJS.Timeout[] = [];
  private readonly observableCallbackStubs: ObservableHandlerStub[] = [];
  private readonly timeouts: NodeJS.Timeout[] = [];

  public componentWillUnmount(): void {
    this.observableCallbackStubs.forEach(handler => handler.unsubscribe());
    this.intervals.forEach(clearInterval);
    this.timeouts.forEach(clearTimeout);
  }

  @autobind
  public registerInterval(interval: NodeJS.Timeout): NodeJS.Timeout {
    this.intervals.push(interval);

    return interval;
  }

  @autobind
  public registerObservableHandler(handler: ObservableHandlerStub): ObservableHandlerStub {
    this.observableCallbackStubs.push(handler);

    return handler;
  }

  @autobind
  public registerTimeout(timeout: NodeJS.Timeout): NodeJS.Timeout {
    this.timeouts.push(timeout);

    return timeout;
  }
}
