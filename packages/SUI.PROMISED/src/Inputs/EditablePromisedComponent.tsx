import { Button } from "antd";
import autobind from "autobind-decorator";
import * as React from "react";

import { IPromisedBaseProps } from "./PromisedBase";

export interface IEditablePromisedComponentProps<T> {
  children: React.ReactElement<IPromisedBaseProps<T>>
  nonEditRender?(value: T): React.ReactNode
}

export class EditablePromisedComponent<T> extends React.Component<
  IEditablePromisedComponentProps<T>,
  {
    editMode?: boolean;
  }
> {
  public constructor(props: IEditablePromisedComponentProps<T>) {
    super(props);
    this.state = {};
  }

  public render(): React.ReactNode {
    return (
      <div
        style={{
          alignItems: "center",
          display: "flex",
        }}
      >
        {this.state.editMode ? React.cloneElement(this.props.children, { promise: this.getPromise }) : (this.props.nonEditRender || this.DEFAULT_RENDERER).apply(null, [this.props.children.props.defaultValue])}
        <Button
          type="primary"
          htmlType="button"
          style={{ marginLeft: 8 }}
          onClick={this.switchEdit}
          icon={this.state && this.state.editMode ? "close" : "edit"}
        />
      </div>
    );
  }

  // tslint:disable-next-line:ban-ts-ignore
  // @ts-ignore
  private readonly DEFAULT_RENDERER = (value: T) => (value != null ? value.toString() : "");

  @autobind
  // tslint:disable-next-line:no-any
  private async getPromise(value: any): Promise<void> {
    // noinspection ES6MissingAwait
    const promise = this.props.children.props.promise(value);
    // noinspection ES6MissingAwait
    promise.then(() => {
      this.setState({ editMode: false })
    });

    return promise;
  }

  @autobind
  private switchEdit(): void {
    this.setState({ editMode: !this.state.editMode });
  }
}
