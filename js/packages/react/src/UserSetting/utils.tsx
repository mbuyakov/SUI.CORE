import {errorNotification} from "@/drawUtils";
import {getUser} from "@/utils";
import {IObjectWithIndex} from "@sui/core";
import axios, {AxiosPromise, AxiosResponse} from "axios";

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
