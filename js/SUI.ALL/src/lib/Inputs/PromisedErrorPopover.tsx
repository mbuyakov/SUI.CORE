import { Popover } from "antd";
import {PopoverProps} from "antd/lib/popover";
import autobind from "autobind-decorator";
import * as React from "react";

export interface IPromisedErrorPopoverProps
  extends Omit<PopoverProps, "content" | "onVisibleChange" | "trigger" | "visible"> {
  promise?: Promise<void>;

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
      <Popover
        {...this.props}
        content={this.state.errorText}
        onVisibleChange={this.handleVisibleChange}
        trigger="click"
        visible={this.state.popoverVisible}
      >
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
