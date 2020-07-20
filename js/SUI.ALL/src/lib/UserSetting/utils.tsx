import * as React from "react";
import {errorNotification} from "../drawUtils";
import {IObjectWithIndex} from "../other";

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
