import capitalize from 'lodash/capitalize';

export const NAME_REGEXP = /^(?=(([А-ЯЁа-яё0-9().]+([\-'`](?!\s|$))?|\s)+))\1$/;
export const LAST_NAME_REGEXP = /^(?=(([А-ЯЁа-яё0-9()]+([\-'`](?!\s|$))?|\s)+))\1$/;
export const WHITESPACE_REGEXP = /^\s+.+$/;
export const ALL_SYMBOL_DIGIT_REGEXP = /^(\d*|[()]*)*$/;
export const LAST_REGEXP_MESSAGE  = "Допустимые символы: А-Я, а-я, 0-9, (), -, ' точка \".\" в Фамилии не допускается, знаки \" - ' ` \" не могут быть последними символами, идти подряд или через пробел";
export const NAME_REGEXP_MESSAGE = "Допустимые символы: А-Я, а-я, 0-9, (), -, ' знаки \" - ' ` \" не могут быть последними символами, идти подряд или через пробел";
export const ALL_SYMBOL_MESSAGE = "Все символы не могут быть в верхнем/нижнем регистре";
export const ALL_SYMBOL_DIGIT_MESSAGE = "Все символы не могут быть цифрами или скобками";
export const WHITESPACE_MESSAGE = "Удалите лишние пробелы в начале";

export function nameValidator(field: "firstName" | "middleName" | "lastName", allowNulls?: boolean): (name: string | null) => string {

  return (name: string): string | null => {
    if (!name || !name.trim().length) {
      return (field === "middleName" || allowNulls) ? '' : "Поле должно быть заполнено";
    } else {
      if (field === 'lastName') {
        return LAST_NAME_REGEXP.test(name)
          ? allSymbolValidatorAndWhiteSpace(name)
          : LAST_REGEXP_MESSAGE;
      } else {
        return NAME_REGEXP.test(name)
          ? allSymbolValidatorAndWhiteSpace(name)
          : NAME_REGEXP_MESSAGE;
      }
    }
  }
}

function allSymbolValidatorAndWhiteSpace(name: string): string {
  return ALL_SYMBOL_DIGIT_REGEXP.test(name)
    ? ALL_SYMBOL_DIGIT_MESSAGE
    : (name === name.toLowerCase() || name === name.toLocaleUpperCase())
      ? ALL_SYMBOL_MESSAGE
      : WHITESPACE_REGEXP.test(name)
        ? WHITESPACE_MESSAGE
        : '';
}

export function fioConverter(name: string): string {
  return fioConverterWithoutTrim(name).trim();
}

export function fioConverterWithoutTrim(name: string): string {
  return name.replace(/\s\s+/g, ' ').replace(/\w+|[А-Яа-яёЁA-Za-z]+/g, capitalize);
}
