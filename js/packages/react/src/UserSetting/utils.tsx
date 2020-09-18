import axios, {AxiosPromise, AxiosResponse} from "axios";
import * as React from "react";
import {IObjectWithIndex} from "@sui/core";
import {errorNotification} from "../drawUtils";
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
    .catch((reason: any) => {
      handleUserRestError(reason);
      if (reThrowError) {
        throw typeof(reThrowError) === "string" ? reThrowError : reason;
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
