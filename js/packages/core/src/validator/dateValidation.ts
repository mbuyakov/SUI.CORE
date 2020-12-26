import moment, {Moment} from 'moment';
import {Nullable} from "@/other";

export const MOMENT_01_01_1900 = moment('1900-01-01');

export const BIRTHDAY_LESS_THAN_01_01_1900_MSG = "Дата рождения не может быть меньше 01.01.1900";
export const BIRTHDAY_IN_FUTURE_MSG = "Дата рождения не может быть в будущем";
export const AGE_LESS_THAN_18_MSG = "Возраст должен быть больше 18 лет";
export const AGE_GREATER_THAN_150_MSG = "Возраст должен быть меньше 150 лет";
export const BIRTHDAY_GREATER_THAN_DEATH_MSG = "Дата рождения должна быть меньше даты смерти";

export const ISSUE_DATE_IN_FUTURE_MSG = "Дата выдачи не может быть в будущем";
export const ISSUE_DATE_LESS_BIRTHDAY_MSG = "Дата выдачи не может быть раньше даты рождения";
export const ISSUE_DATE_FROM_14_MSG = "Данный документ выдается с 14 лет";
export const ISSUE_DATE_FROM_18_MSG = "Данный документ выдается с 18 лет";

// Common stub for all variants. Algorithm:
// If age >= 45 years + 30 days, then issue date > 45 years
// If age >= 20 years + 30 days, then issue date > 20 years
// Else issue date > 14 years
export const PASSPORT_ISSUE_DATE_BROKEN_MSG = "Недопустимая дата выдача паспорта";


export function isFutureDate(target: Moment): boolean {
  return target > moment().endOf('day');
}

export function getAge(birthday: Moment): number {
  return moment().diff(birthday, 'years');
}

//**************
// Common naming rules
// **Validator - receive Moment as params, return empty string if OK, error text if failed
// disable** or dateDisabledFor** - receive Moment as params, return (target: Moment) => boolean (true if target is disabled). Usually wrapper for **Validator
//**************

/**
 * Minimal birthday - 01.01.1900
 * Max age - 150
 * adultOnly - valid age only 18+
 */
export function birthDayValidator(birthday: Moment, deathDate: Nullable<Moment>, adultOnly: boolean): string {
  const age = getAge(birthday);

  switch (true) {
    case isFutureDate(birthday):
      return BIRTHDAY_IN_FUTURE_MSG;
    case deathDate != null && deathDate < birthday:
      return BIRTHDAY_GREATER_THAN_DEATH_MSG;
    case birthday < MOMENT_01_01_1900:
      return BIRTHDAY_LESS_THAN_01_01_1900_MSG;
    case age < 18 && adultOnly:
      return AGE_LESS_THAN_18_MSG;
    case age > 150:
      return AGE_GREATER_THAN_150_MSG;
  }

  return '';
}

export function dateDisabledForBirthday(deathDate: Nullable<Moment>, adultOnly: boolean): (target: Moment) => boolean {
  return (target: Moment): boolean => birthDayValidator(target, deathDate, adultOnly) !== '';
}

export function issueDateValidator(issueDate: Moment, docCode: number, birthday: Moment) {
  switch (true) {
    case isFutureDate(issueDate):
      return ISSUE_DATE_IN_FUTURE_MSG;
    case issueDate < birthday:
      return ISSUE_DATE_LESS_BIRTHDAY_MSG;
    case docCode == 21: // Паспорт гражданина РФ
      const current = moment();
      const birthdayPlus45y = birthday.clone().add(45, 'years');
      const birthdayPlus20y = birthday.clone().add(20, 'years');
      const birthdayPlus14y = birthday.clone().add(14, 'years');
      if (
        birthdayPlus45y.clone().add(30, "days") <= current && issueDate < birthdayPlus45y ||
        birthdayPlus20y.clone().add(30, "days") <= current && issueDate < birthdayPlus20y ||
        birthdayPlus14y.clone().add(30, "days") <= current && issueDate < birthdayPlus14y
      ) {
        return PASSPORT_ISSUE_DATE_BROKEN_MSG;
      } else {
        return '';
      }
    case docCode == 14 && issueDate.diff(birthday, 'years') < 14: // Временное удостоверение личности гражданина РФ
      return ISSUE_DATE_FROM_14_MSG;
    case [7, 8].includes(docCode) && issueDate.diff(birthday, 'years') < 18: // Военный билет солдата и Временное удостоверение, выданное взамен военного билета
      return ISSUE_DATE_FROM_18_MSG;
    case true:
      return '';
  }
}

export function dateDisabledForIssueDate(docCode: number, birthday: Moment): (target: Moment) => boolean {
  return (target: Moment): boolean => issueDateValidator(target, docCode, birthday) !== '';
}
