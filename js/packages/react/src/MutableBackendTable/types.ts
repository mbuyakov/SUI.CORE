import {ButtonProps} from "antd/lib/button";

import {IObjectWithIndex} from "@sui/core";
import {BackendTable} from "../BackendTable";
import {PromisedButton} from "../Inputs";
import {IPromisedBaseFormModalOnlyModalProps, IPromisedBaseFormModalProps} from "../Modal";
import {ExtractProps} from "../other";

import { DEFAULT_MODAL_WIDTH_VARIANT } from './MutableBackendTable';

type IPromisedBaseFormModalPropsBase<T> = Omit<IPromisedBaseFormModalProps<T>, "onSubmit" | "baseFormProps">;
export type BaseFormProps<T> = IPromisedBaseFormModalProps<T>["baseFormProps"];
export type BaseFormPropsFn<T> = (row: IObjectWithIndex) => BaseFormProps<T>;

export type IMutableBackendTableProps<TValues, TSelection, TEditValues = TValues> =
  Omit<ExtractProps<BackendTable<TSelection>>, "innerRef" | "extra" | "ref">
  & {
  width?: keyof (typeof DEFAULT_MODAL_WIDTH_VARIANT),
  // Modal props
  commonModalProps?: Partial<IPromisedBaseFormModalOnlyModalProps>;
  createBaseFormModalProps?: IPromisedBaseFormModalPropsBase<TValues>;
  editBaseFormModalProps?: IPromisedBaseFormModalPropsBase<TEditValues>;
  // Customize buttons
  createButtonProps?: Omit<ButtonProps, "onClick">;
  deleteButtonProps?: Omit<ExtractProps<PromisedButton>, "promise">;
  // BaseFormProps
  createBaseFormProps: BaseFormProps<TValues>;
  editBaseFormProps?: BaseFormProps<TEditValues> | BaseFormPropsFn<TEditValues>; // if unset then createBaseFormProps will be used
  // Handlers
  handleCreate?: IPromisedBaseFormModalProps<TValues>["onSubmit"];
  handleDelete?(selection: TSelection[]): Promise<void>;
  handleEdit?(values: TEditValues, row: IObjectWithIndex): Promise<boolean>;
  // !!! EDIT MODE ENABLER
  getEditInitialValues?(row: IObjectWithIndex): Promise<Partial<TEditValues>>;
  // Others
  editableFilter?(row: IObjectWithIndex): boolean;
  mutationRoles?: string[];
  customExtra?(createButton: JSX.Element, deleteButton: JSX.Element): JSX.Element;
  disableDeleteNotification?: boolean;
};
