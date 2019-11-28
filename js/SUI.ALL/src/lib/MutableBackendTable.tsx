import {Button, notification} from 'antd';
import {ButtonProps} from "antd/lib/button";
import {ModalProps} from "antd/lib/modal";
import autobind from "autobind-decorator";
import * as React from "react";

import {BackendTable} from "./BackendTable";
import {BaseForm, IBaseFormProps} from "./Base";
import {errorNotification} from "./drawUtils";
import {PromisedButton} from "./Inputs";
import {ObservableBinder} from "./Observable";
import {ExtractProps} from "./other";
import {defaultModalFooter, PromisedModal} from "./PromisedModal";
import {roleVisibilityWrapper} from "./RoleVisibilityWrapper";
import {defaultIfNotBoolean} from "./typeWrappers";

// tslint:disable-next-line:variable-name
export const MutableBackendTableButtonGap = 32;
type INoPromisePromisedButtonProps = Omit<ExtractProps<PromisedButton>, "promise">;

export type IMutableBackendTableProps<TValues, TSelection> =
  Omit<ExtractProps<BackendTable<TSelection>>, "innerRef" | "extra" | "ref">
  & {
  baseFormProps: Omit<IBaseFormProps, "children" | "onSubmit" | "ref">;
  createButtonProps?: Omit<ButtonProps, "onClick">;
  createModalProps?: Omit<ModalProps, "visible" | "onOk" | "footer" | "ref">;
  deleteButtonProps?: INoPromisePromisedButtonProps;
  modalHeader?: React.ReactNode;
  mutationRoles?: string[];
  customExtra?(createButton: JSX.Element, deleteButton: JSX.Element): JSX.Element;
  handleDelete?(selection: TSelection[]): Promise<void>;
  onSubmit?(values: TValues): Promise<boolean>;
};

interface IMutableBackendTableState {
  modalVisible: boolean;
}

export class MutableBackendTable<TValues extends {}, TSelection = number>
  extends React.Component<IMutableBackendTableProps<TValues, TSelection>, IMutableBackendTableState> {

  public readonly formRef: React.RefObject<BaseForm> = React.createRef();
  public readonly modalRef: React.RefObject<PromisedModal> = React.createRef();
  public readonly tableRef: React.RefObject<BackendTable<TSelection>> = React.createRef();

  public constructor(props: IMutableBackendTableProps<TValues, TSelection>) {
    super(props);
    this.state = {
      modalVisible: false
    };
  }

  public render(): JSX.Element {
    const {
      createButtonProps,
      deleteButtonProps,
      mutationRoles
    } = this.props;

    const onModalSubmit = async (): Promise<boolean> => {
      if (this.props.onSubmit && this.formRef.current) {
        const result = await this.formRef.current.onSubmit();

        if (result && this.tableRef.current) {
          // tslint:disable-next-line:no-floating-promises
          this.tableRef.current.refresh();
        }

        return result;
      }

      return true;
    };

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

    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    const hasErrors = this.formRef.current && this.formRef.current.hasErrors;

    return (
      <>
        <BackendTable<TSelection>
          {...this.props}
          innerRef={this.tableRef}
          selectionEnabled={!!extra && defaultIfNotBoolean(this.props.selectionEnabled, true)} // Отключение selection в случае невидимости кнопок по ролям
          extra={extra}
        />
        <PromisedModal
          {...this.props.createModalProps}
          ref={this.modalRef}
          promise={onModalSubmit}
          // tslint:disable-next-line:jsx-no-lambda
          customFooter={(okButton, cancelButton): JSX.Element => defaultModalFooter(
            hasErrors
              ? (
                <ObservableBinder observable={hasErrors}>
                  {hasErrorsValue => React.cloneElement(okButton, {disabled: hasErrorsValue || okButton.props.disabled})}
                </ObservableBinder>
              ) : okButton,
            cancelButton
          )}
        >
          {this.props.modalHeader}
          <BaseForm
            ref={this.formRef}
            noCard={true}
            verticalLabel={true}
            {...this.props.baseFormProps}
            onSubmit={this.props.onSubmit}
          />
        </PromisedModal>
      </>
    );
  }

  @autobind
  private handleCreateClick(): void {
    if (this.modalRef.current) {
      this.modalRef.current.setModalVisibility(true, () => setTimeout(() => this.forceUpdate(), 100));
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

}
