import { Icon as LegacyIcon } from '@ant-design/compatible';
import {Button} from "antd";
import autobind from "autobind-decorator";
import * as React from "react";

import { DisableEditContext } from "../DisableEditContext";
import {hasAnyRole} from "../RoleVisibilityWrapper";
import {EDITABLE_PROMISED_COMPONENT_CHILDREN} from '../styles';

import {IPromisedBaseProps} from "./PromisedBase";

export interface IEditablePromisedComponentProps<T> {
  children: React.ReactElement<IPromisedBaseProps<T>>;
  editRoles?: string[];

  nonEditRender?(value: T): React.ReactNode;
}

export class EditablePromisedComponent<T>
  extends React.Component<IEditablePromisedComponentProps<T>, { editMode?: boolean; }> {

  public constructor(props: IEditablePromisedComponentProps<T>) {
    super(props);
    this.state = {};
  }

  public render(): React.ReactNode {
    return (
      <DisableEditContext.Consumer>
        {disableEdit => {
          const editAllowed = !disableEdit && (this.props.editRoles ? hasAnyRole(this.props.editRoles) : true);
          const editMode = editAllowed && this.state.editMode;

          return (
            <div
              style={{
                alignItems: "center",
                display: "flex",
              }}
              className={EDITABLE_PROMISED_COMPONENT_CHILDREN}
            >
              {editMode ? React.cloneElement(this.props.children, {promise: this.getPromise}) : (this.props.nonEditRender || this.DEFAULT_RENDERER).apply(null, [this.props.children.props.defaultValue])}
              {editAllowed && (
                <Button
                  size="small"
                  htmlType="button"
                  style={{marginLeft: editMode ? 4 : 8, flexShrink: 0, padding: "0 4px"}}
                  onClick={this.switchEdit}
                  icon={<LegacyIcon type={editMode ? "close" : "edit"}/>}
                />
              )}
            </div>
          );
        }}
      </DisableEditContext.Consumer>
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
      this.setState({editMode: false})
    });

    return promise;
  }

  @autobind
  private switchEdit(): void {
    this.setState({editMode: !this.state.editMode});
  }

}
