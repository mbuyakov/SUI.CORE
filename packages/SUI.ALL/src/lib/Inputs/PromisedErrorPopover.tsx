import { Popover } from "antd";
import autobind from "autobind-decorator";
import * as React from "react";

export interface IPromisedErrorPopoverProps {
  promise?: Promise<void>
}

export class PromisedErrorPopover extends React.Component<
  IPromisedErrorPopoverProps,
  {
    currentPromise?: Promise<void>;
    errorText?: string;
    popoverVisible?: boolean;
  }
> {
  public constructor(props: IPromisedErrorPopoverProps) {
    super(props);
    this.state = {};
  }

  public render(): JSX.Element {
    this.onUpdate();

    return (
      <Popover trigger="click" visible={this.state.popoverVisible} onVisibleChange={this.handleVisibleChange} content={this.state.errorText}>
        {this.props.children}
      </Popover>
    );
  }

  @autobind
  private handleVisibleChange(visible: boolean): void {
    if (visible) {
      // Ignore
      return;
    }
    this.setState({ popoverVisible: visible });
  }

  @autobind
  private onUpdate(): void {
    // tslint:disable-next-line:no-promise-as-boolean
    if (this.props.promise && this.props.promise !== this.state.currentPromise) {
      this.setState({ currentPromise: this.props.promise });
      this.props.promise.catch(reason => {
        console.error(reason);
        this.setState({ errorText: reason.toString(), popoverVisible: true });
      });
    }
  }
}
