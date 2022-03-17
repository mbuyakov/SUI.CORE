import {Nullable} from "@sui/core";

export const MIN_NAME_LENGTH = 2;
export const MIN_NAME_LENGTH_MESSAGE = "Минимальная длина - 2 символа";

export const MIN_USERNAME_LENGTH = 3;
export const MIN_USERNAME_LENGTH_MESSAGE = "Минимальная длина - 3 символа";

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_PASSWORD_LENGTH_MESSAGE = 'Минимальная длина - 8 символов';

export const MAX_PASSWORD_LENGTH = 50;
export const MAX_PASSWORD_LENGTH_MESSAGE = 'Максимальная длина - 50 символов';

// https://stackoverflow.com/a/21456918
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-*])[A-Za-z\d!\-*]+$/;
export const PASSWORD_REGEX_MESSAGE = "Пароль должен состоять из заглавных и прописных латинских букв A-z, цифр 0-9 и специальных символов !-*";

interface IPasswordValidatorParams {
  password: Nullable<string>;
  username: Nullable<string>;
  email: Nullable<string>;
  callback: (error: string | string[] | void) => void
}

export function passwordValidator({password, username, email, callback}: IPasswordValidatorParams): void {
  const notNullPassword = password || "";

  if (notNullPassword.length < MIN_PASSWORD_LENGTH) {
    callback(MIN_PASSWORD_LENGTH_MESSAGE);
    return;
  }

  if (notNullPassword.length > MAX_PASSWORD_LENGTH) {
    callback(MAX_PASSWORD_LENGTH_MESSAGE);
    return;
  }

  if (!PASSWORD_REGEX.test(notNullPassword)) {
    callback(PASSWORD_REGEX_MESSAGE);
    return;
  }

  if (notNullPassword.trim() === username?.trim()) {
    callback("Пароль не должен совпадать с именем пользователя");
    return;
  }

  if (notNullPassword.trim() === email?.trim()) {
    callback("Пароль не должен совпадать с адресом электронной почты");
    return;
  }

  callback();
}
