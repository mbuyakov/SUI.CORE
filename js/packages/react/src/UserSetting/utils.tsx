import axios, {AxiosPromise, AxiosResponse} from "axios";
import {IObjectWithIndex, Nullable} from "@sui/core";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";
import * as React from "react";
import {MAX_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH_MESSAGE, MIN_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH_MESSAGE, PASSWORD_EMAIL_MATCH_MESSAGE, PASSWORD_REGEX, PASSWORD_REGEX_MESSAGE, PASSWORD_USERNAME_MATCH_MESSAGE} from "@/UserSetting/const";

// noinspection ES6PreferShortImport
import {errorNotification} from "../drawUtils";
// noinspection ES6PreferShortImport
import {getUser} from "../utils";

export function doHandledUserRestRequest<T, R = void>(
  uri: string,
  onSuccess: (response: AxiosResponse<R>) => void | Promise<void>,
  body?: T,
  headers?: IObjectWithIndex,
  reThrowError: string | boolean = "Ошибка сохранения"
): Promise<void> {
  return doUserRestRequest<T, R>(uri, body, headers)
    .then(onSuccess)
    .catch((reason) => {
      handleUserRestError(reason);
      if (reThrowError) {
        throw typeof (reThrowError) === "string" ? reThrowError : reason;
      }
    });
}

export function doUserRestRequest<T, R = void>(
  uri: string,
  body?: T,
  headers?: IObjectWithIndex,
): AxiosPromise<R> {
  return axios.post<R>(
    uri,
    body,
    {
      headers: {
        authorization: `Bearer ${getUser().accessToken}`,
        "content-type": "application/json",
        ...headers
      }
    }
  );
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
export function handleUserRestError(reason: any, message?: string): void {
  const {data} = reason.response;
  const errors = data.errors
    ? data.errors.map((error: IObjectWithIndex) => error.defaultMessage)
    : [data.message];

  errors.forEach((error: IObjectWithIndex) => errorNotification(
    message || "Ошибка при сохранении пользователя",
    error
  ));
}

interface IPasswordValidatorParams {
  password: Nullable<string>;
  username: Nullable<string>;
  email: Nullable<string>;
}

interface IPasswordValidatorResult {
  minLength: boolean;
  maxLength: boolean;
  passwordRegex: boolean;
  usernameMatch: boolean;
  emailMatch: boolean;
}

export function passwordValidator({password, username, email}: IPasswordValidatorParams): IPasswordValidatorResult {
  const notNullPassword = password || "";

  return {
    minLength: notNullPassword.length >= MIN_PASSWORD_LENGTH,
    maxLength: notNullPassword.length <= MAX_PASSWORD_LENGTH,
    passwordRegex: PASSWORD_REGEX.test(notNullPassword),
    usernameMatch: notNullPassword.trim() !== username?.trim(),
    emailMatch: notNullPassword.trim() !== email?.trim()
  };
}

export function PasswordValidatorHelp({validationResult}: {validationResult: IPasswordValidatorResult}): JSX.Element {
  const successRender = (message: string): JSX.Element => (
    <div>
      <CheckOutlined style={{color: "green"}}/>
      <span style={{marginLeft: 12, color: "green"}}>{message}</span>
    </div>
  );
  const errorRender = (message: string): JSX.Element => (
    <div>
      <CloseOutlined style={{color: "red"}}/>
      <span style={{marginLeft: 12, color: "red"}}>{message}</span>
    </div>
  );

  const rows = [
    {success: validationResult.minLength, message: MIN_PASSWORD_LENGTH_MESSAGE},
    {success: validationResult.maxLength, message: MAX_PASSWORD_LENGTH_MESSAGE},
    {success: validationResult.passwordRegex, message: PASSWORD_REGEX_MESSAGE},
    {success: validationResult.usernameMatch, message: PASSWORD_USERNAME_MATCH_MESSAGE},
    {success: validationResult.emailMatch, message: PASSWORD_EMAIL_MATCH_MESSAGE}
  ];

  return (<div>{rows.map(it => it.success ? successRender(it.message) : errorRender(it.message))}</div>);
}
