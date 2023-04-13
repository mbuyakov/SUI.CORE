/* eslint-disable @typescript-eslint/no-explicit-any */
import {DeleteOutlined, IssuesCloseOutlined} from "@ant-design/icons";
import {Typography} from "@material-ui/core";
import {EMAIL_REGEXP, IRole, IUser, IUserRole, NO_DATA_TEXT, OneOrArrayWithNulls, wrapInArrayWithoutNulls} from "@sui/core";
import {Card, Select, Tooltip} from "antd";
import * as React from "react";

// noinspection ES6PreferShortImport
import {BaseCard, IBaseCardItemLayout, IBaseCardRowLayout} from "../Base";
// noinspection ES6PreferShortImport
import {EditablePromisedComponent, PromisedButton, PromisedInput, PromisedSelect} from "../Inputs";
// noinspection ES6PreferShortImport
import {isAdmin} from "../utils";
// noinspection ES6PreferShortImport
import {WaitData} from "../WaitData";

import {MAX_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH_MESSAGE, MIN_NAME_LENGTH, MIN_NAME_LENGTH_MESSAGE, MIN_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH_MESSAGE, MIN_USERNAME_LENGTH, MIN_USERNAME_LENGTH_MESSAGE} from "./const";

const COLSPAN = 2;

interface IUserCardProps<TDetail, TAdditional> {
  additionalMainInfoRows?: OneOrArrayWithNulls<IBaseCardRowLayout<any, IBaseCardItemLayout<any>>>;
  additionalRows?: OneOrArrayWithNulls<IBaseCardRowLayout<any, IBaseCardItemLayout<any>>>;
  allowDeleteOperations?: boolean;
  extraHeader?: JSX.Element;
  roles?: IRole[];
  userData: IUser<TDetail> & TAdditional;

  handleDeleteChange(): Promise<void>;

  updateMainInfoPartFn(key: "name" | "email" | "username"): (value: string) => Promise<void>;

  updatePassword(password: string): Promise<void>;

  updateRoles(roleIds: string[] | null | undefined): Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export class UserCard<TDetail = {}, TAdditional = {}> extends React.Component<IUserCardProps<TDetail, TAdditional>> {

  public constructor(props: IUserCardProps<TDetail, TAdditional>) {
    super(props);
    this.state = {};
  }

  public render(): JSX.Element {
    return (
      <WaitData
        data={this.props.userData}
        alwaysUpdate={true}
      >
        {(userData): JSX.Element => (
          <Card
            style={{width: 700}}
          >
            <div
              style={{
                display: "grid",
                gap: 8,
                gridTemplateColumns: "1fr max-content"
              }}
            >
              <Typography variant="h2" style={{width: "100%"}}>{userData.name}</Typography>
              <div>
                {this.props.extraHeader}
                {(typeof this.props.allowDeleteOperations === "boolean" ? this.props.allowDeleteOperations : isAdmin())
                  ? (
                    <Tooltip
                      title={userData.deleted ? "Отменить удаление" : "Удалить"}
                      placement="topLeft"
                    >
                      <PromisedButton
                        type={userData.deleted ? undefined : "danger" as any}
                        icon={userData.deleted ? (<IssuesCloseOutlined/>) : (<DeleteOutlined/>)}
                        promise={this.props.handleDeleteChange}
                        popconfirmSettings={{
                          placement: "topRight",
                          title: `Вы уверены, что хотите ${userData.deleted ? 'восстановить' : 'удалить'} данного пользователя?`,
                        }}
                      />
                    </Tooltip>
                  ) : null}
              </div>
            </div>
            <BaseCard
              noCard={true}
              item={userData}
              rows={[
                {
                  isDivider: true,
                  dividerText: "Основная информация"
                },
                {
                  cols: {
                    colspan: COLSPAN,
                    items: {
                      title: "ФИО",
                      dataKey: "name",
                      render: (name: string): JSX.Element => (
                        <EditablePromisedComponent>
                          <PromisedInput
                            promise={this.props.updateMainInfoPartFn("name")}
                            defaultValue={name}
                            validator={[{min: MIN_NAME_LENGTH, message: MIN_NAME_LENGTH_MESSAGE}]}
                          />
                        </EditablePromisedComponent>
                      )
                    }
                  }
                },
                {
                  cols: {
                    colspan: COLSPAN,
                    items: {
                      title: "Электронная почта",
                      dataKey: "email",
                      render: (email: string): JSX.Element => (
                        <EditablePromisedComponent>
                          <PromisedInput
                            promise={this.props.updateMainInfoPartFn("email")}
                            defaultValue={email}
                            validator={[{pattern: EMAIL_REGEXP, message: 'Невалидный адрес электронной почты'}]}
                          />
                        </EditablePromisedComponent>
                      )
                    }
                  }
                },
                {
                  cols: {
                    colspan: COLSPAN,
                    items: {
                      title: "Имя пользователя",
                      dataKey: "username",
                      render: (username: string): JSX.Element => (
                        <EditablePromisedComponent>
                          <PromisedInput
                            promise={this.props.updateMainInfoPartFn("username")}
                            defaultValue={username}
                            validator={[{min: MIN_USERNAME_LENGTH, message: MIN_USERNAME_LENGTH_MESSAGE}]}
                          />
                        </EditablePromisedComponent>
                      )
                    }
                  }
                },
                ...(this.props.additionalMainInfoRows ? wrapInArrayWithoutNulls(this.props.additionalMainInfoRows) : []),
                {
                  isDivider: true,
                  dividerText: "Пароль"
                },
                {
                  cols: {
                    colspan: COLSPAN,
                    items: {
                      title: "Пароль",
                      render: (): JSX.Element => (
                        <EditablePromisedComponent
                          nonEditRender={(): string => "********"}
                        >
                          <PromisedInput
                            promise={this.props.updatePassword}
                            type={"password" as any}
                            validator={[
                              {min: MIN_PASSWORD_LENGTH, message: MIN_PASSWORD_LENGTH_MESSAGE},
                              {max: MAX_PASSWORD_LENGTH, message: MAX_PASSWORD_LENGTH_MESSAGE}
                            ]}
                          />
                        </EditablePromisedComponent>
                      )
                    }
                  }
                },
                {
                  isDivider: true,
                  dividerText: "Роли"
                },
                {
                  cols: {
                    colspan: COLSPAN,
                    items: {
                      title: "Список ролей",
                      dataKey: ["userRolesByUserId", "nodes"],
                      render: (userRoles: IUserRole[] | undefined): JSX.Element => (
                        <EditablePromisedComponent
                          nonEditRender={(roleIds: string[] | undefined): string => roleIds?.length
                            ? this.props.roles?.filter(role => roleIds.includes(role.id)).map(role => role.rusName).join(", ")
                            : NO_DATA_TEXT
                          }
                        >
                          <PromisedSelect
                            promise={this.props.updateRoles}
                            mode="multiple"
                            defaultValue={userRoles?.map(userRole => userRole.roleId)}
                            validator={[{required: true, message: "Роли должны быть заполнены", type: "array"}]}
                          >
                            {this.props.roles?.map(role => (<Select.Option key={role.id} value={role.id}>{role.rusName}</Select.Option>))}
                          </PromisedSelect>
                        </EditablePromisedComponent>
                      )
                    }
                  }
                },
                ...(this.props.additionalRows ? wrapInArrayWithoutNulls(this.props.additionalRows) : [])
              ]}
            />
          </Card>
        )}
      </WaitData>
    );
  }

}
