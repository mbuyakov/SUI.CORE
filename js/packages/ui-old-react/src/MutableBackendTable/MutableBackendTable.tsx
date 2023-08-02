/* eslint-disable @typescript-eslint/no-explicit-any */
import {MuiIcons} from "@sui/deps-material";
import {DeleteOutlined, PlusCircleOutlined} from "@ant-design/icons";
import {getDataByKey, sleep} from "@sui/util-chore";
import {defaultIfNotBoolean, unCapitalize, wrapInArray} from "@sui/ui-old-core";
import {Button, notification} from "@sui/deps-antd";
import autobind from "autobind-decorator";
import * as React from "react";
import {hasAnyRole} from "@/RoleVisibilityWrapper";
import {PromisedBaseFormModal} from "@/Modal";
import {errorNotification} from "@/drawUtils";
import {DisableEditContext} from "@/DisableEditContext";
import {BackendTable, DEFAULT_SERVICE_COLUMN_ICON_BUTTON_STYLE, DEFAULT_SERVICE_COLUMN_WIDTH} from "@/BackendTable";
import {PromisedButton, PromisedMaterialIconButton} from "../Inputs";

import {IMutableBackendTableProps} from "./types";
import {IObjectWithIndex} from "@sui/util-types";


export const MutableBackendTableButtonGap = 32;

export const DEFAULT_MODAL_WIDTH_VARIANT = {
  small: 600,
  medium: 900,
  large: 1500
};

interface IMutableBackendTableState<T> {
  editModalInitialValues?: Partial<T>;
  editRow?: IObjectWithIndex;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class MutableBackendTable<TValues extends {}, TSelection = number, TEditValues = TValues>
  extends React.Component<IMutableBackendTableProps<TValues, TSelection, TEditValues>, IMutableBackendTableState<TEditValues>> {

  public readonly createBaseFormModalRef: React.RefObject<PromisedBaseFormModal<TValues>> = React.createRef();
  public readonly editBaseFormModalRef: React.RefObject<PromisedBaseFormModal<TEditValues>> = React.createRef();
  public readonly tableRef: React.RefObject<BackendTable<TSelection>> = React.createRef();

  public constructor(props: IMutableBackendTableProps<TValues, TSelection, TEditValues>) {
    super(props);
    this.state = {};
  }

  public render(): React.JSX.Element {
    return (
      <DisableEditContext.Consumer>
        {(disableEdit): JSX.Element => {
          const {
            mutationRoles,
            getEditInitialValues,
            handleCreate,
            handleEdit,
            serviceColumns,
            editableFilter
          } = this.props;
          const allowEdit = !disableEdit && (mutationRoles ? hasAnyRole(mutationRoles) : true);
          const rowEditable = !!getEditInitialValues && allowEdit;

          const createButton = this.generateCreateButton();
          const deleteButton = this.generateDeleteButton();

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

          extra = allowEdit ? extra : null;

          const editBaseFormModalProps = this.props.editBaseFormModalProps || this.props.createBaseFormModalProps;
          const editBaseFormProps = this.props.editBaseFormProps
            ? typeof (this.props.editBaseFormProps) === "function"
              ? this.state.editRow
                ? this.props.editBaseFormProps(this.state.editRow)
                : undefined
              : this.props.editBaseFormProps
            : {...this.props.createBaseFormProps, uuid: `${getDataByKey(this.props.createBaseFormProps, "uuid") || ""}__EDIT`};

          const _serviceColumns = wrapInArray(serviceColumns ?? []);

          if (rowEditable) {
            _serviceColumns.unshift({
              id: "__edit",
              render: (_: null, row: IObjectWithIndex): React.JSX.Element =>
                (!editableFilter || editableFilter(row))
                  ? (
                    <PromisedMaterialIconButton
                      style={DEFAULT_SERVICE_COLUMN_ICON_BUTTON_STYLE}
                      icon={<MuiIcons.CreateOutlined/>}
                      promise={this.handleEditClickFn(row)}
                    />
                  )
                  : (<div/>),
              title: " ",
              width: DEFAULT_SERVICE_COLUMN_WIDTH,
            });
          }

          const width = (this.props.width && {width: DEFAULT_MODAL_WIDTH_VARIANT[this.props.width]});
          return (
            <>
              <BackendTable<TSelection>
                {...this.props}
                innerRef={this.tableRef}
                selectionEnabled={defaultIfNotBoolean(this.props.selectionEnabled, true)}
                extra={extra}
                serviceColumns={_serviceColumns}
              />
              {/* Create modal */}
              <PromisedBaseFormModal<TValues>
                {...width}
                {...this.props.commonModalProps}
                {...this.props.createBaseFormModalProps}
                baseFormProps={this.props.createBaseFormProps}
                ref={this.createBaseFormModalRef}
                onSubmit={this.submitDecorator(handleCreate)}
              />
              {/* Edit modal */}
              {rowEditable && (
                <PromisedBaseFormModal<TEditValues>
                  {...width}
                  {...this.props.commonModalProps}
                  {...editBaseFormModalProps}
                  ref={this.editBaseFormModalRef}
                  baseFormProps={{
                    ...editBaseFormProps,
                    initialValues: {
                      ...(editBaseFormProps && editBaseFormProps.initialValues),
                      ...this.state.editModalInitialValues
                    }
                  }}
                  onSubmit={this.submitDecorator(values => handleEdit(values, this.state.editRow))}
                />
              )}
            </>
          );
        }}
      </DisableEditContext.Consumer>
    );
  }

  @autobind
  public generateDeleteButton(): JSX.Element {
    const deleteButtonProps = this.props.deleteButtonProps;
    return (
      <PromisedButton
        icon={<DeleteOutlined/>}
        popconfirmSettings={{
          placement: "topRight",
          title: `Вы уверены, что хотите ${typeof deleteButtonProps?.children === "string" ?
            unCapitalize(deleteButtonProps?.children) : "удалить"} выбранные записи?`
        }}
        {...deleteButtonProps}
        promise={this.handleDeleteClick}
      >
        {deleteButtonProps && deleteButtonProps.children || "Удалить"}
      </PromisedButton>
    );
  }

  @autobind
  public generateCreateButton(): JSX.Element {
    const createButtonProps = this.props.createButtonProps;
    return (
      <Button
        icon={<PlusCircleOutlined/>}
        {...createButtonProps}
        onClick={this.showBaseModalFn(this.createBaseFormModalRef)}
      >
        {createButtonProps && createButtonProps.children || "Создать"}
      </Button>
    );
  }

  @autobind
  private async handleDeleteClick(): Promise<void> {
    const selection = this.tableRef.current.getSelection();
    const deleteButtonProps = this.props.deleteButtonProps;

    if (selection.length) {
      if (this.props.handleDelete) {
        await (this.props.handleDelete(selection)
          .then(async () => {
            if (!defaultIfNotBoolean(this.props.disableDeleteNotification, false)) {
              notification.success({message: "Записи успешно удалены"});
            }
            this.tableRef.current?.clearSelection?.();

            return this.tableRef?.current?.refresh?.();
          })
          .catch(err => {
            if (err) {
              const errMsg = (typeof err === "string")
                ? err
                : (err.hasOwnProperty("message")
                  ? err.message
                  : err.toString());
              errorNotification("Возникла ошибка в процессе удаления", errMsg);
            }
          }));
      }
    } else {
      errorNotification("Ничего не выбрано", `Пожалуйста, выберите записи, которые Вы хотите
      ${typeof deleteButtonProps?.children === "string" ? unCapitalize(deleteButtonProps?.children) : "удалить"}`);
    }
  }

  @autobind
  private handleEditClickFn(row: IObjectWithIndex): () => Promise<void> {
    return async (): Promise<void> => {
      const {getEditInitialValues} = this.props;

      if (getEditInitialValues) {
        this.setState(
          {
            editModalInitialValues: await getEditInitialValues(row),
            editRow: row
          },
          this.showBaseModalFn(this.editBaseFormModalRef)
        );
        await sleep(500);
      } else {
        throw new Error("getEditInitialValues can not be null");
      }
    };
  }

  @autobind
  private showBaseModalFn<T>(ref: React.RefObject<PromisedBaseFormModal<T>>): () => void {
    return (): void => {
      const baseFormModal = ref.current;

      if (baseFormModal && baseFormModal.modalRef.current) {
        baseFormModal.modalRef.current.setModalVisibility(true);
      }
    };
  }

  @autobind
  private submitDecorator<T>(propsSubmitFn?: (values: T) => Promise<boolean>): (values: T) => Promise<boolean> {
    return async (values): Promise<boolean> => {
      if (propsSubmitFn) {
        const result = await propsSubmitFn(values);

        if (result && this.tableRef.current) {
          this.tableRef.current.refresh();
        }

        return result;
      }

      return true;
    };
  }

}
