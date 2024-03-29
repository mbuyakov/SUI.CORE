import {DeleteOutlined, PlusCircleOutlined} from "@ant-design/icons/lib";
import CreateIcon from '@material-ui/icons/CreateOutlined';
import { Icon } from '@ant-design/compatible';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import {Button, notification} from 'antd';
import autobind from "autobind-decorator";
import * as React from "react";

import {BackendTable} from "../BackendTable";
import {getDataByKey} from "../dataKey";
import {DisableEditContext} from '../DisableEditContext';
import {errorNotification} from "../drawUtils";
import {PromisedButton, PromisedMaterialIconButton} from '../Inputs';
import {PromisedBaseFormModal} from "../Modal";
import {IObjectWithIndex, sleep} from '../other';
import {hasAnyRole} from "../RoleVisibilityWrapper";
import {defaultIfNotBoolean} from "../typeWrappers";

import {IMutableBackendTableProps} from "./types";

export const MutableBackendTableButtonGap = 32;

export const DEFAULT_MODAL_WIDTH_VARIANT = {
  small: 600,
  medium: 900,
  large: 1500
};
interface IMutableBackendTableState<T> {
  editModalInitialValues?: Partial<T>;
  editRow?: IObjectWithIndex;
  initEditLoading: boolean;
}

export class MutableBackendTable<TValues extends {}, TSelection = number, TEditValues = TValues>
  extends React.Component<IMutableBackendTableProps<TValues, TSelection, TEditValues>, IMutableBackendTableState<TEditValues>> {

  public readonly createBaseFormModalRef: React.RefObject<PromisedBaseFormModal<TValues>> = React.createRef();
  public readonly editBaseFormModalRef: React.RefObject<PromisedBaseFormModal<TEditValues>> = React.createRef();
  public readonly tableRef: React.RefObject<BackendTable<TSelection>> = React.createRef();

  public constructor(props: IMutableBackendTableProps<TValues, TSelection, TEditValues>) {
    super(props);
    this.state = {initEditLoading: false};
  }

  public render(): JSX.Element {
    return (
      <DisableEditContext.Consumer>
        {(disableEdit): JSX.Element => {
          const {
            createButtonProps,
            deleteButtonProps,
            mutationRoles,
            getEditInitialValues,
            handleCreate,
            handleEdit,
            serviceColumns
          } = this.props;
          const allowEdit = !disableEdit && (mutationRoles ? hasAnyRole(mutationRoles) : true);
          const rowEditable = !!getEditInitialValues && allowEdit;

          const createButton = (
            <Button
              icon={<PlusCircleOutlined/>}
              {...createButtonProps}
              onClick={this.showBaseModalFn(this.createBaseFormModalRef)}
            >
              {createButtonProps && createButtonProps.children || "Создать"}
            </Button>
          );

          const deleteButton = (
            <PromisedButton
              icon={<DeleteOutlined/>}
              {...deleteButtonProps}
              promise={this.handleDeleteClick}
              popconfirmSettings={{
                placement: "topRight",
                title: "Вы уверены, что хотите удалить выбранные записи?"
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

          extra = allowEdit ? extra : null;

          const editBaseFormModalProps = this.props.editBaseFormModalProps || this.props.createBaseFormModalProps;
          const editBaseFormProps = this.props.editBaseFormProps
            ? typeof (this.props.editBaseFormProps) === "function"
              ? this.state.editRow
                ? this.props.editBaseFormProps(this.state.editRow)
                : undefined
              : this.props.editBaseFormProps
            : {...this.props.createBaseFormProps, uuid: `${getDataByKey(this.props.createBaseFormProps, "uuid") || ""}__EDIT`};

          const width = (this.props.width && {width: DEFAULT_MODAL_WIDTH_VARIANT[this.props.width]});

          return (
            <>
              <BackendTable<TSelection>
                {...this.props}
                innerRef={this.tableRef}
                selectionEnabled={!!extra && defaultIfNotBoolean(this.props.selectionEnabled, true)} // Отключение selection в случае невидимости кнопок по ролям
                extra={extra}
                serviceColumns={!rowEditable
                  ? serviceColumns
                  : [{
                    id: "__edit",
                    render: (_: null, row: {id: TSelection}): JSX.Element => (
                      <PromisedMaterialIconButton
                        style={{
                          marginBottom: -12,
                          marginTop: -12
                        }}
                        loading={this.state.initEditLoading}
                        icon={<CreateIcon/>}
                        promise={this.handleEditClickFn(row)}
                      />
                    ),
                    title: " ",
                    width: defaultIfNotBoolean(this.props.selectionEnabled, true) ? 80 : (80 + 32),
                  }]
                    .concat((serviceColumns || []) as any[])
                }
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
  private async handleDeleteClick(): Promise<void> {
    const selection = this.tableRef.current.getSelection();

    if (selection.length) {
      if (this.props.handleDelete) {
        await (this.props.handleDelete(selection)
          .then(async () => {
            if (!!this.props.disableDeleteNotification){
              notification.success({message: "Записи успешно удалены"});
            }
            this.tableRef.current.clearSelection();

            return this.tableRef.current.refresh();
          })
          .catch(err => {
            if(err) {
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
      errorNotification("Ничего не выбрано", "Пожалуйста, выберите записи, которые Вы хотите удалить");
    }
  }

  @autobind
  private handleEditClickFn(row: IObjectWithIndex): () => Promise<void> {
    return async (): Promise<void> => {
      const {getEditInitialValues} = this.props;

      if (getEditInitialValues) {
        this.setState({initEditLoading: true});
        this.setState(
          {
            editModalInitialValues: await getEditInitialValues(row),
            editRow: row
          },
          this.showBaseModalFn(this.editBaseFormModalRef)
        );
        await sleep(500);
        this.setState({initEditLoading: false});
      } else {
        throw new Error("getEditInitialValues can not be null");
      }
    }
  }

  @autobind
  private showBaseModalFn<T>(ref: React.RefObject<PromisedBaseFormModal<T>>): () => void {
    return (): void => {
      const baseFormModal = ref.current;

      if (baseFormModal && baseFormModal.modalRef.current) {
        baseFormModal.modalRef.current.setModalVisibility(true);
      }
    }
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
    }
  }

}
