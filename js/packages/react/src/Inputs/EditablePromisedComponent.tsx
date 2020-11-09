import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CreateIcon from '@material-ui/icons/CreateOutlined';
import autobind from "autobind-decorator";
import * as React from "react";
import { AfterChangeContext } from '@/AfterChangeContext';

import { DisableEditContext } from "../DisableEditContext";
import {hasAnyRole} from "../RoleVisibilityWrapper";
import {EDITABLE_PROMISED_COMPONENT_CHILDREN} from '../styles';

import {IPromisedBaseProps} from "./PromisedBase";
import { ChangedEditModeContext } from "../ChangedEditModeContext";

export interface IEditablePromisedComponentProps<T> {
  children: React.ReactElement<IPromisedBaseProps<T>>;
  editRoles?: string[];

  nonEditRender?(value: T): React.ReactNode;
}

export class EditablePromisedComponent<T>
  extends React.Component<IEditablePromisedComponentProps<T>, { editMode?: boolean; }> {

  private afterChange: () => void;
  private setDisabledEditMode: (disalbedEditMode: boolean) => void;

  public constructor(props: IEditablePromisedComponentProps<T>) {
    super(props);
    this.state = {};
  }

  public render(): React.ReactNode {
    return (
      <AfterChangeContext.Consumer>
        {afterChange => {
          this.afterChange = afterChange;
          return (
            <ChangedEditModeContext.Consumer>
              {({disabledEditMode, setDisabledEditMode}) => {
                console.debug("Change edit mode context", disabledEditMode);
                this.setDisabledEditMode = setDisabledEditMode;
                return (
                  <DisableEditContext.Consumer>
                    {disableEdit => {
                      const editAllowed = !disableEdit && !disabledEditMode && (this.props.editRoles ? hasAnyRole(this.props.editRoles) : true);
                      const editMode = editAllowed && this.state.editMode;

                      return (
                        <div
                          style={{
                            alignItems: "center",
                            display: "flex",
                            wordBreak: "break-word"
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
                              {editMode ? (<CloseIcon/>) : (<CreateIcon/>)}
                            </IconButton>
                          )}
                        </div>
                      );
                    }}
                  </DisableEditContext.Consumer>
                );
              }            }</ChangedEditModeContext.Consumer>
          );
        }}
      </AfterChangeContext.Consumer>
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
      this.setEditMode(false);
      if (this.afterChange) {
        this.afterChange();
      }
    });

    return promise;
  }

  @autobind
  private switchEdit(): void {
    const newEditMode = !this.state.editMode;
    this.setEditMode(newEditMode);
  }

  @autobind
  private setEditMode(editMode: boolean): void {
    console.debug("set edit mode", editMode);
    this.setState({editMode});
    this.setDisabledEditMode(editMode);
  }
}
