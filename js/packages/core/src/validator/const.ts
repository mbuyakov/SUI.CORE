export const EMAIL_REGEXP = /^(?:[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

export const PHONE_MASK = "+1(111)111-11-11";
export const PHONE_MASK_LENGTH = 11;

export const INN_MASK = "1111 111111 11";
export const INN_MASK_LENGTH = 12;

export const OMS_MASK = "1111 1111 1111 1111";
export const OMS_MASK_LENGTH = 16;

export const SNILS_MASK = "111-111-111 11";
export const SNILS_MASK_LENGTH = 11;

export const KPP_MASK = "1111 11 111";
export const KPP_MASK_LENGTH = 9;

export const ORGANIZATION_INN_MASK = "1111111111";
export const ORGANIZATION_INN_MASK_LENGTH = 10;

export const OGRN_MASK = "1 11 11 1111111 1";
export const OGRN_MASK_LENGTH = 13;

export const ISSUED_BY_REGEX = "^[А-Яа-я\\s№.\\-]{1,250}$";
export const ISSUED_BY_DESC = "Только кирилица и символы \"№ . -\" до 250 знаков";

export const DEPARTMENT_CODE_REGEX = "^[0-9]{3}\\-[0-9]{3}$";
export const DEPARTMENT_CODE_DESC = "7 знаков, NNN-NNN, где N - число";
