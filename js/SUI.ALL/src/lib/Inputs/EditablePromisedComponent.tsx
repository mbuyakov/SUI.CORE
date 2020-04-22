import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CreateIcon from '@material-ui/icons/CreateOutlined';
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
                <IconButton
                  onClick={this.switchEdit}
                  style={{marginLeft: 6}}
                  size="small"
                >
                  {editMode? (<CloseIcon/>) : (<CreateIcon/>)}
                </IconButton>
              )}
            </div>
          );
        }}
      </DisableEditContext.Consumer>
    );
  }

  // @ts-ignore
  private readonly DEFAULT_RENDERER = (value: T) => (value != null ? value.toString() : "");

  @autobind
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
