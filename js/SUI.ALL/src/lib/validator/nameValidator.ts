export const NAME_REGEXP = /^(((?:[А-Яа-яA-Za-z0-9()]+[\-'][А-Яа-яA-Za-z0-9()]+\s*))*((?:[А-Яа-яA-Za-z0-9().]+\s*))*)+$/;
export const SURNAME_REGEXP = /^(((?:[А-Яа-яA-Za-z0-9()]+[\-'][А-Яа-яA-Za-z0-9()]+\s*))*((?:[А-Яа-яA-Za-z0-9()]+\s*))*)+$/;
export const WHITESPACE_REGEXP = /^\s+.+$/;
export const HYPHEN_REGEXP = /\-$/;
export const ONLY_ONE_ALPHABET_REGEXP = /^(?:[^А-Яа-я]*|[^A-Za-z]*)$/;
export const ALL_SYMBOL_DIGIT_REGEXP = /^((?:\d+)*|(?:[()]+)*)*$/;
export const POINT_REGEXP_SURNAME_REGEXP = /(?:\s*\.\s*)/;
export const NAME_REGEXP_MESSAGE = "Допустимые символы: А-Я,а-я,A-Z,a-z,0-9,(),-,' точка \".\" в Фамилии не допускается";
export const ALL_SYMBOL_MESSAGE = "Все символы не могут быть в верхнем/нижнем регистре";
export const ALL_SYMBOL_DIGIT_MESSAGE = "Все символы не могут быть цифрами или скобками";
export const WHITESPACE_MESSAGE = "Удалите лишние пробелы в начале";
export const ONLY_ONE_ALPHABET_MESSAGE = "Введите все буквы в одной раскладке";
export const HYPHEN_REGEXP_MESSAGE = "Знак \"-\" не может быть последним символом, идти подряд или через пробел";
export const POINT_REGEXP_SURNAME_MESSAGE = "Точка \".\" в Фамилии не допускается";

export function nameValidator(field: string, allowNulls?: boolean): (name: string | null) => string {

  return (name: string): string | null => {
    if (!name || !name.trim().length) {
      return (field === "middleName" || allowNulls) ? '' : "Поле должно быть заполнено";
      // tslint:disable-next-line:unnecessary-else
    } else {
      // tslint:disable-next-line:no-parameter-reassignment
      if (!ONLY_ONE_ALPHABET_REGEXP.test(name)) {
        return ONLY_ONE_ALPHABET_MESSAGE;
        // tslint:disable-next-line:unnecessary-else
      } else {
        if (field === 'surName') {
          return SURNAME_REGEXP.test(name)
            ? allSymbolValidator(name)
            : whiteSpaceAndHyphenValidator(name);
          // tslint:disable-next-line:unnecessary-else
        } else {
          return NAME_REGEXP.test(name)
            ? allSymbolValidator(name)
            : whiteSpaceAndHyphenValidator(name);
        }
      }
    }
  }
}

function allSymbolValidator(name: string): string {
  return ALL_SYMBOL_DIGIT_REGEXP.test(name)
    ? ALL_SYMBOL_DIGIT_MESSAGE
    : (name === name.toLowerCase() || name === name.toLocaleUpperCase())
      ? ALL_SYMBOL_MESSAGE
      : '';
}
function whiteSpaceAndHyphenValidator(name: string): string {
  return WHITESPACE_REGEXP.test(name)
    ? WHITESPACE_MESSAGE
    : POINT_REGEXP_SURNAME_REGEXP.test(name)
      ? POINT_REGEXP_SURNAME_MESSAGE
      : HYPHEN_REGEXP.test(name)
        ? HYPHEN_REGEXP_MESSAGE
        : NAME_REGEXP_MESSAGE;
}
