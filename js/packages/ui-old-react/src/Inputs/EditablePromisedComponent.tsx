import {MuiIcons, IconButton} from "@sui/deps-material";
import autobind from "autobind-decorator";
import * as React from "react";
import {AfterChangeContext} from "@/AfterChangeContext";

import {DisableEditContext} from "@/DisableEditContext";
import {hasAnyRole} from "@/RoleVisibilityWrapper";
import {EDITABLE_PROMISED_COMPONENT_CHILDREN} from "@/styles";

import {ChangedEditModeContext} from "@/ChangedEditModeContext";
import {IPromisedBaseProps} from "./PromisedBase";


export interface IEditablePromisedComponentProps<T> {
  children: React.ReactElement<IPromisedBaseProps<T>>;
  disableEdit?: boolean;
  editRoles?: string[];

  nonEditRender?(value: T): React.ReactNode;
}

export class EditablePromisedComponent<T>
  extends React.Component<IEditablePromisedComponentProps<T>, { editMode?: boolean; }> {

  private afterChange: () => void;
  private setOuterEditMode: (editMode: boolean) => void;

  public constructor(props: IEditablePromisedComponentProps<T>) {
    super(props);
    this.state = {};
  }

  public render(): React.ReactNode {
    return (
      <AfterChangeContext.Consumer>
        {(afterChange): JSX.Element => {
          this.afterChange = afterChange;
          return (
            <ChangedEditModeContext.Consumer>
              {(editModeValue): JSX.Element => {
                this.setOuterEditMode = editModeValue.setEditMode;

                return (
                  <DisableEditContext.Consumer>
                    {(disableEdit): JSX.Element => {
                      const editAllowed = !this.props.disableEdit
                        && (!disableEdit || !!this.state?.editMode)
                        && (!this.props.editRoles || hasAnyRole(this.props.editRoles));

                      const editMode = !!this.state?.editMode;

                      return (
                        <DisableEditContext.Provider value={editModeValue.outerDisable}>
                          <div
                            style={{
                              alignItems: "center",
                              display: "flex",
                              wordBreak: "break-word"
                            }}
                            className={EDITABLE_PROMISED_COMPONENT_CHILDREN}
                          >
                            {editMode ? React.cloneElement(this.props.children, {promise: this.getPromise}) : (this.props.nonEditRender || this.DEFAULT_RENDERER).apply(null, [this.props.children.props.defaultValue])}
                            {(editMode || editAllowed) && (
                              <IconButton
                                onClick={this.switchEdit}
                                style={{marginLeft: 6, padding: 0}}
                                size="small"
                              >
                                {editMode ? (<MuiIcons.Close/>) : (<MuiIcons.CreateOutlined/>)}
                              </IconButton>
                            )}
                          </div>
                        </DisableEditContext.Provider>
                      );
                    }}
                  </DisableEditContext.Consumer>
                );
              }}</ChangedEditModeContext.Consumer>
          );
        }}
      </AfterChangeContext.Consumer>
    );
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private readonly DEFAULT_RENDERER = (value: T): string => (value != null ? value.toString() : "");

  @autobind
  private async getPromise(value: unknown): Promise<void> {
    // noinspection ES6MissingAwait
    const promise = this.props.children.props.promise(value as T);
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
    this.setState({editMode});
    this.setOuterEditMode(editMode);
  }
}
