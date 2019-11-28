import {Button, notification} from 'antd';
import {ButtonProps} from "antd/lib/button";
import autobind from "autobind-decorator";
import * as React from "react";

import {BackendTable} from "./BackendTable";
import {errorNotification} from "./drawUtils";
import {PromisedButton} from "./Inputs";
import {IPromisedBaseFormModalOnlyModalProps, IPromisedBaseFormModalProps, PromisedBaseFormModal} from "./Modal";
import {ExtractProps} from "./other";
import {roleVisibilityWrapper} from "./RoleVisibilityWrapper";
import {defaultIfNotBoolean} from "./typeWrappers";

// tslint:disable-next-line:variable-name
export const MutableBackendTableButtonGap = 32;
type INoPromisePromisedButtonProps = Omit<ExtractProps<PromisedButton>, "promise">;

export type IMutableBackendTableProps<TValues, TSelection> =
  Omit<ExtractProps<BackendTable<TSelection>>, "innerRef" | "extra" | "ref">
  & Omit<IPromisedBaseFormModalProps<TValues>, keyof IPromisedBaseFormModalOnlyModalProps>
  & {
  createButtonProps?: Omit<ButtonProps, "onClick">;
  createModalProps?: IPromisedBaseFormModalOnlyModalProps;
  deleteButtonProps?: INoPromisePromisedButtonProps;
  mutationRoles?: string[];
  customExtra?(createButton: JSX.Element, deleteButton: JSX.Element): JSX.Element;
  handleDelete?(selection: TSelection[]): Promise<void>;
};

export class MutableBackendTable<TValues extends {}, TSelection = number>
  extends React.Component<IMutableBackendTableProps<TValues, TSelection>> {

  public readonly baseFormModalRef: React.RefObject<PromisedBaseFormModal<TValues>> = React.createRef();
  public readonly tableRef: React.RefObject<BackendTable<TSelection>> = React.createRef();

  public render(): JSX.Element {
    const {
      createButtonProps,
      deleteButtonProps,
      mutationRoles
    } = this.props;

    const createButton = (
      <Button
        icon="plus-circle"
        {...createButtonProps}
        onClick={this.handleCreateClick}
      >
        {createButtonProps && createButtonProps.children || "Создать"}
      </Button>
    );

    const deleteButton = (
      <PromisedButton
        icon="delete"
        {...deleteButtonProps}
        promise={this.handleDeleteClick}
        popconfirmSettings={{
          placement: "topRight",
          title: "Вы уверены что хотите удалить выбранные записи?"
        }}
      >
        {deleteButtonProps && deleteButtonProps.children || "Удалить"}
      </PromisedButton>
    );

    let extra = this.props.customExtra
      ? this.props.customExtra(createButton, deleteButton)
      : (
        <div
          style={{
            display: "grid",
            gap: MutableBackendTableButtonGap,
            gridTemplateColumns: "1fr 1fr"
          }}
        >
          {createButton}
          {deleteButton}
        </div>
      );

    extra = mutationRoles ? roleVisibilityWrapper({content: extra, roles: mutationRoles}) : extra;

    return (
      <>
        <BackendTable<TSelection>
          {...this.props}
          innerRef={this.tableRef}
          selectionEnabled={!!extra && defaultIfNotBoolean(this.props.selectionEnabled, true)} // Отключение selection в случае невидимости кнопок по ролям
          extra={extra}
        />
        <PromisedBaseFormModal
          {...this.props.createModalProps}
          baseFormProps={this.props.baseFormProps}
          modalHeader={this.props.modalHeader}
          onSubmit={this.onSubmit}
          ref={this.baseFormModalRef}
        />
      </>
    );
  }

  @autobind
  private handleCreateClick(): void {
    const baseFormModal = this.baseFormModalRef.current;

    if (baseFormModal && baseFormModal.modalRef.current) {
      baseFormModal.modalRef.current.setModalVisibility(
        true,
        () => setTimeout(() => this.forceUpdate(), 100)
      );
    }
  }

  @autobind
  private async handleDeleteClick(): Promise<void> {
    const selection = this.tableRef.current.getSelection();

    if (selection.length) {
      if (this.props.handleDelete) {
        await this.props.handleDelete(selection)
          .then(async () => {
            notification.success({message: "Записи успешно удалены"});
            this.tableRef.current.clearSelection();

            return this.tableRef.current.refresh();
          });
      }
    } else {
      errorNotification("Ничего не выбрано", "Пожалуйста, выберите записи, которые Вы хотите удалить");
    }
  }

  @autobind
  private async onSubmit(values: TValues): Promise<boolean> {
    if (this.props.onSubmit) {
      const result = await this.props.onSubmit(values);

      if (result && this.tableRef.current) {
        // tslint:disable-next-line:no-floating-promises
        this.tableRef.current.refresh();
      }

      return result;
    }

    return true;
  }

}
