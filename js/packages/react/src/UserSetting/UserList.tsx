/* eslint-disable @typescript-eslint/no-explicit-any */
import {EMAIL_REGEXP, IObjectWithIndex, OneOrArrayWithNulls, wrapInArrayWithoutNulls} from "@sui/core";
import {Input} from "antd";
import autobind from "autobind-decorator";
import React from "react";

// noinspection ES6PreferShortImport
import {BaseForm, IBaseCardRowLayout, IBaseFormItemLayout} from "../Base";
// noinspection ES6PreferShortImport
import {SelectWithWaitData} from "../Inputs";
// noinspection ES6PreferShortImport
import {MutableBackendTable} from "../MutableBackendTable";
// noinspection ES6PreferShortImport
import {ExtractProps} from "../other";

import {MAX_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH_MESSAGE, MIN_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH_MESSAGE, MIN_USERNAME_LENGTH, MIN_USERNAME_LENGTH_MESSAGE} from "./const";
import {ICreateUserFormValues} from "./types";

const TABLE_NAME = "user_ui";
const isDeleted = (user: { deleted?: boolean }): boolean => !!user.deleted;

interface IUserListProps<T> {
  additionalRows?: OneOrArrayWithNulls<IBaseCardRowLayout<any, IBaseFormItemLayout>>;
  tableProps?: { table?: string } & Omit<ExtractProps<MutableBackendTable<ICreateUserFormValues<T>>>, "table" | "handleCreate" | "handleDelete" | "selectionFilter" | "createBaseFormProps">;

  afterRolesChange?(roleIds: string[], form: BaseForm): void;

  handleCreate(values: ICreateUserFormValues<T>): Promise<boolean>;

  handleDelete(ids: string[]): Promise<void>;

  isDeleted?(row: IObjectWithIndex): boolean;

  nameValidator?(_: any, value: string, callback: any): void

  userNameValidator?(_: any, value: string, callback: any): void
}

// eslint-disable-next-line @typescript-eslint/ban-types
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
                  inputNode: <Input autoComplete={"off"} placeholder="Введите ФИО"/>,
                  required: true,
                  rules: [this.props.nameValidator ? {validator: this.props.nameValidator} : {}],
                  title: "ФИО"
                }
              }
            },
            {
              cols: {
                items: {
                  fieldName: "email",
                  inputNode: <Input autoComplete={"off"} placeholder="Введите электронную почту"/>,
                  required: true,
                  rules: [{pattern: EMAIL_REGEXP, message: 'Невалидный адрес электронной почты'}],
                  title: "Электронная почта"
                }
              }
            },
            {
              cols: {
                items: {
                  initialValue: '',
                  fieldName: "username",
                  inputNode: <Input autoComplete={"off"} placeholder="Введите имя пользователя"/>,
                  required: true,
                  rules: [this.props.userNameValidator ? {validator: this.props.userNameValidator} : {min: MIN_USERNAME_LENGTH, message: MIN_USERNAME_LENGTH_MESSAGE}],
                  title: "Имя пользователя"
                }
              }
            },
            {
              cols: {
                items: {
                  initialValue: '',
                  fieldName: "password",
                  inputNode: <Input autoComplete={"off"} type="password" placeholder="Введите пароль"/>,
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
                  afterChange: (roleIds, form): void => this.props.afterRolesChange(roleIds || [], form)
                }
              }
            },
            ...(this.props.additionalRows ? wrapInArrayWithoutNulls(this.props.additionalRows) : [])
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
