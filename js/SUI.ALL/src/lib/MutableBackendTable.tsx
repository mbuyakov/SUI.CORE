import {Button, Modal, notification} from 'antd';
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
    createModalProps?: Omit<ModalProps, "visible" | "onOk" | "footer">;
    deleteButtonProps?: INoPromisePromisedButtonProps;
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

  public readonly formRef: React.RefObject<BaseForm> = React.createRef<BaseForm>();
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
      createModalProps,
      deleteButtonProps,
      mutationRoles
    } = this.props;
    const okButtonProps = createModalProps ? createModalProps.okButtonProps: undefined;
    const onCancel = this.onModalClose;

    // tslint:disable-next-line:ban-ts-ignore
    // @ts-ignore
    const hasErrors = this.formRef.current && this.formRef.current.hasErrors;
    const okButton = (hasErrorsValue: boolean): JSX.Element => (
      <PromisedButton
        type="primary"
        {...okButtonProps}
        // tslint:disable-next-line:jsx-no-lambda
        promise={async (): Promise<void> => {
          if (this.props.onSubmit && this.formRef.current) {
            const result = await this.formRef.current.onSubmit();

            if (result && this.tableRef.current) {
              // tslint:disable-next-line:no-floating-promises
              this.tableRef.current.refresh();
            } else { // Else don't refresh table and don't close modal
              return;
            }
          }

          this.setModalVisibility(false);
        }}
        disabled={hasErrorsValue || (okButtonProps && okButtonProps.disabled)}
      >
        {createModalProps && createModalProps.okText || "Создать"}
      </PromisedButton>
    );

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
        <Modal
          visible={this.state.modalVisible}
          destroyOnClose={true}
          {...createModalProps}
          bodyStyle={{
            paddingBottom: 0,
            ...(createModalProps ? createModalProps.bodyStyle : undefined)
          }}
          footer={(
            <div
              style={{
                display: "grid",
                gap: 8,
                gridTemplateColumns: "repeat(2, max-content)",
                justifyContent: "right"
              }}
            >
              <Button
                {...(createModalProps ? createModalProps.cancelButtonProps : {})}
                onClick={onCancel}
              >
                {createModalProps && createModalProps.cancelText || "Отмена"}
              </Button>
              {hasErrors // TODO: Костыль, BaseForm + Observable - мусор
                ? (<ObservableBinder observable={hasErrors}>{okButton}</ObservableBinder>)
                : okButton(false)}
            </div>
          )}
          onCancel={onCancel}
        >
          <BaseForm
            ref={this.formRef}
            noCard={true}
            verticalLabel={true}
            {...this.props.baseFormProps}
            onSubmit={this.props.onSubmit}
          />
        </Modal>
      </>
    );
  }

  @autobind
  private handleCreateClick(): void {
    this.setModalVisibility(true, () => setTimeout(() => this.forceUpdate(), 100));
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
  private onModalClose(): void {
    this.setModalVisibility(false);

  }

  @autobind
  private setModalVisibility(modalVisible: boolean = true, callback?: () => void): void {
    this.setState({modalVisible}, callback);
  }

}
