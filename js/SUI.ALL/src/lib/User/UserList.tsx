/* tslint:disable:no-magic-numbers jsx-no-lambda */
import {Input} from "antd";
import autobind from "autobind-decorator";
import React from "react";
import {BaseForm, IBaseCardRowLayout, IBaseFormItemLayout} from "../Base";
import {SelectWithWaitData} from "../Inputs";
import {MutableBackendTable} from "../MutableBackendTable";
import {ExtractProps, IObjectWithIndex} from "../other";
import {OneOrArrayWithNulls, wrapInArrayWithoutNulls} from "../typeWrappers";
import {EMAIL_REGEXP} from "../validator";
import {MAX_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH_MESSAGE, MIN_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH_MESSAGE, MIN_USERNAME_LENGTH, MIN_USERNAME_LENGTH_MESSAGE} from "./const";
import {ICreateUserFormValues} from "./types";

const TABLE_NAME = "user_ui";
const isDeleted = (user: { deleted?: boolean }) => !user.deleted;

interface IUserListProps<T> {
  additionalRows?: OneOrArrayWithNulls<IBaseCardRowLayout<any, IBaseFormItemLayout>>;
  tableProps?: { table?: string } & Omit<ExtractProps<MutableBackendTable<ICreateUserFormValues<T>>>, "table" | "handleCreate" | "handleDelete" | "selectionFilter" | "createBaseFormProps">;
  afterRolesChange?(roleIds: string[], form: BaseForm): void;
  handleCreate(values: ICreateUserFormValues<T>): Promise<boolean>;
  handleDelete(ids: string[]): Promise<void>;
  isDeleted?(row: IObjectWithIndex): boolean;
}

export class UserList<T extends {}> extends React.Component<IUserListProps<T>> {

  public render(): JSX.Element {
    return (
      <MutableBackendTable<ICreateUserFormValues<T>>
        table={TABLE_NAME}
        {...this.props.tableProps}
        handleCreate={this.props.handleCreate}
        handleDelete={this.handleDelete}
        selectionFilter={this.props.isDeleted || isDeleted}
        createBaseFormProps={{
          uuid: "create-user-form",
          rows: [
            {
              cols: {
                items: {
                  fieldName: "name",
                  inputNode: <Input placeholder="Введите ФИО"/>,
                  required: true,
                  title: "ФИО"
                }
              }
            },
            {
              cols: {
                items: {
                  fieldName: "email",
                  inputNode: <Input placeholder="Введите электронную почту"/>,
                  required: true,
                  rules: [{pattern: EMAIL_REGEXP, message: 'Невалидный адрес электронной почты'}],
                  title: "Электронная почта"
                }
              }
            },
            {
              cols: {
                items: {
                  fieldName: "username",
                  inputNode: <Input placeholder="Введите имя пользователя"/>,
                  required: true,
                  rules: [{min: MIN_USERNAME_LENGTH, message: MIN_USERNAME_LENGTH_MESSAGE}],
                  title: "Имя пользователя"
                }
              }
            },
            {
              cols: {
                items: {
                  fieldName: "password",
                  inputNode: <Input type="password" placeholder="Введите пароль"/>,
                  required: true,
                  rules: [
                    {min: MIN_PASSWORD_LENGTH, message: MIN_PASSWORD_LENGTH_MESSAGE},
                    {max: MAX_PASSWORD_LENGTH, message: MAX_PASSWORD_LENGTH_MESSAGE}
                  ],
                  title: "Пароль"
                }
              }
            },
            {
              cols: {
                items: {
                  fieldName: "roleIds",
                  required: true,
                  inputNode: (
                    <SelectWithWaitData
                      multiple={true}
                      placeholder="Выберите роли"
                      valueTableIdentifier="roles"
                    />
                  ),
                  title: "Роли",
                  afterChange: (roleIds, form) => this.props.afterRolesChange(roleIds || [], form)
                }
              }
            },
            ...(this.props.additionalRows ? wrapInArrayWithoutNulls(this.props.additionalRows) : undefined)
          ]
        }}
      />
    );
  }

  @autobind
  private async handleDelete(selection: number[]): Promise<void> {
    return this.props.handleDelete(selection.map(String));
  }

}
