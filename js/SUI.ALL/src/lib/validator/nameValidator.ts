export const NAME_REGEXP = /^(((?:[A-Za-z0-9()]+[\-'][A-Za-z]+\s*)|(?:[А-Яа-я0-9()]+[\-'][А-Яа-я0-9()]+\s*))*((?:(?![А-Яа-я]+)([A-Za-z0-9().]+)(?![А-Яа-я]+)\s*)|(?:(?![A-Za-z]+)([А-Яа-я0-9().]+)(?![A-Za-z]+)\s*)|))+$/;
export const SURNAME_REGEXP = /^(((?:[A-Za-z0-9()]+[\-']\s*)|(?:[А-Яа-я0-9()]+[\-']\s*))*((?:(?![А-Яа-я]+)([A-Za-z0-9()]+)(?![А-Яа-я]+)\s*)|(?:(?![A-Za-z]+)([А-Яа-я0-9()]+)(?![A-Za-z]+)\s*)|))+$/;
export const WHITESPACE_REGEXP = /^\s+.+$/;
export const HYPHEN_REGEXP = /(?:\s*\-\s*)/;
export const ONLY_ONE_ALPHABET_REGEXP = /^(?:[^А-Яа-я]*|[^A-Za-z]*)$/;
export const ALL_SYMBOL_DIGIT_REGEXP = /^((?:\d+)*|(?:[()]+)*)*$/; // (?:\s+\-\s*)
export const NAME_REGEXP_MESSAGE = "Допустимые символы: А-Я,а-я,A-Z,a-z,0-9,(),-,' точка \".\" в Фамилии не допускается";
export const ALL_SYMBOL_MESSAGE = "Все символы не могут быть в верхнем/нижнем регистре";
export const ALL_SYMBOL_DIGIT_MESSAGE = "Все символы не могут быть цифрами или скобками";
export const WHITESPACE_MESSAGE = "Удалите лишние пробелы в начале";
export const ONLY_ONE_ALPHABET_MESSAGE = "Введите все буквы в одной раскладке";
export const HYPHEN_REGEXP_MESSAGE = "Знак \"-\" не может быть последним символом, идти подряд или через пробел";

export function nameValidator(field: string): (name: string | null) => string {
  return (name: string): string | null => {
    if (!name || !name.trim().length) {
      return field === "middleName" ? '' : "Поле должно быть заполнено";
      // tslint:disable-next-line:unnecessary-else
    } else {
      // tslint:disable-next-line:no-parameter-reassignment
      if (!ONLY_ONE_ALPHABET_REGEXP.test(name)) {
        return ONLY_ONE_ALPHABET_MESSAGE;
        // tslint:disable-next-line:unnecessary-else
      } else {
        if (field === 'surName') {
          return SURNAME_REGEXP.test(name)
            ? ALL_SYMBOL_DIGIT_REGEXP.test(name)
              ? ALL_SYMBOL_DIGIT_MESSAGE
              : (name === name.toLowerCase() || name === name.toLocaleUpperCase())
                ? ALL_SYMBOL_MESSAGE
                : ''
            : WHITESPACE_REGEXP.test(name)
              ? WHITESPACE_MESSAGE
              : HYPHEN_REGEXP.test(name)
                ? HYPHEN_REGEXP_MESSAGE
                : NAME_REGEXP_MESSAGE;
          // tslint:disable-next-line:unnecessary-else
        } else {
          return NAME_REGEXP.test(name)
            ? ALL_SYMBOL_DIGIT_REGEXP.test(name)
              ? ALL_SYMBOL_DIGIT_MESSAGE
              : (name === name.toLowerCase() || name === name.toLocaleUpperCase())
                ? ALL_SYMBOL_MESSAGE
                : ''
            : WHITESPACE_REGEXP.test(name)
              ? WHITESPACE_MESSAGE
              : HYPHEN_REGEXP.test(name)
                ? HYPHEN_REGEXP_MESSAGE
                : NAME_REGEXP_MESSAGE;
        }
      }
    }
  }
}
