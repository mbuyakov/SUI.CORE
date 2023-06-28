
export const MIN_NAME_LENGTH = 2;
export const MIN_NAME_LENGTH_MESSAGE = "Минимальная длина - 2 символа";

export const MIN_USERNAME_LENGTH = 3;
export const MIN_USERNAME_LENGTH_MESSAGE = "Минимальная длина - 3 символа";

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_PASSWORD_LENGTH_MESSAGE = "Минимальная длина - 8 символов";

export const MAX_PASSWORD_LENGTH = 50;
export const MAX_PASSWORD_LENGTH_MESSAGE = "Максимальная длина - 50 символов";

// https://stackoverflow.com/a/21456918
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!\-*])[A-Za-z\d!\-*]+$/;
export const PASSWORD_REGEX_MESSAGE = "Пароль должен состоять из заглавных и прописных латинских букв A-z, цифр 0-9 и специальных символов !-*";

export const PASSWORD_USERNAME_MATCH_MESSAGE = "Пароль не должен совпадать с именем пользователя";

export const PASSWORD_EMAIL_MATCH_MESSAGE = "Пароль не должен совпадать с адресом электронной почты";
