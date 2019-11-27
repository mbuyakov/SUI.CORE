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

// tslint:disable-next-line:variable-name
export const MutableBackendTableButtonGap = 32;
type INoPromisePromisedButtonProps = Omit<ExtractProps<PromisedButton>, "promise">;

export type IMutableBackendTableProps<TValues, TSelection> =
  Omit<ExtractProps<BackendTable<TSelection>>, "selectionEnabled" | "innerRef" | "extra" | "ref">
  & {
    baseFormProps: Omit<IBaseFormProps, "children" | "onSubmit" | "ref">;
    createButtonProps?: Omit<ButtonProps, "onClick">;
    createModalProps?: Omit<ModalProps, "visible" | "onOk" | "footer">;
    deleteButtonProps?: INoPromisePromisedButtonProps;
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
      deleteButtonProps
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
            await this.formRef.current.onSubmit();

            if (this.tableRef.current) {
              this.tableRef.current.refresh();
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

    return (
      <>
        <BackendTable<TSelection>
          {...this.props}
          innerRef={this.tableRef}
          selectionEnabled={true}
          extra={this.props.customExtra
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
            )}
        />
        <Modal
          visible={this.state.modalVisible}
          destroyOnClose={true}
          {...createModalProps}
          bodyStyle={{
            paddingBottom: 0,
            ...(createModalProps ? createModalProps.bodyStyle : undefined)
          }}
          footer={[
            <Button
              {...(createModalProps ? createModalProps.cancelButtonProps : {})}
              key="back"
              onClick={onCancel}
            >
              {createModalProps && createModalProps.cancelText || "Отмена"}
            </Button>,
            // TODO: Костыль, BaseForm + Observable - мусор
            hasErrors
              ? (
                <ObservableBinder
                  observable={hasErrors}
                  key="submit"
                >
                  {okButton}
                </ObservableBinder>
              ) : okButton(false)
          ]}
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
          .then(() => {
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
