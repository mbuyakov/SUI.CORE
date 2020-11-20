import moment, {Moment} from 'moment';

import {dateDisabler} from "./utils";

export function disableFutureDate(current: Moment): boolean {
  return current > moment().endOf('day');
}

export function getAge(birthday: Moment): number {
  return moment().diff(birthday, 'years');
}

export const BIRTHDAY_NO_LESS_YEARS_AGO_FROM_NOW = 18;
export const BIRTHDAY_NO_MORE_YEARS_AGO_FROM_NOW = 150;
export const BIRTHDAY_LESS_THAN_18_MSG = "Возраст должен быть больше 18 лет";
export const BIRTHDAY_GREATER_THAN_150_MSG = "Возраст должен быть меньше 150 лет";
export const BIRTHDAY_GREATER_THAN_DEATH_MSG = "Дата рождения должна быть меньше даты смерти";
export const BIRTHDAY_ERROR_MSG = "Укажите корректную дату рождения";

export function birthDayValidator(birthDay: Moment, deathDateString: string): string {
  if (deathDateString != null && disableBirthdayDateWithDeathDate(deathDateString)(birthDay)) {
    return BIRTHDAY_GREATER_THAN_DEATH_MSG;
  }

  const cmp = checkDateInRangeOfYearsFromNow(-BIRTHDAY_NO_MORE_YEARS_AGO_FROM_NOW, -BIRTHDAY_NO_LESS_YEARS_AGO_FROM_NOW, birthDay);
  if (cmp > 0) {
    return BIRTHDAY_LESS_THAN_18_MSG;
  }
  if (cmp < 0) {
    return BIRTHDAY_GREATER_THAN_150_MSG;
  }

  return '';
}

export function disableBirthdayDateWithDeathDate(deathDate: string): (current: Moment) => boolean {
  return (current: Moment): boolean => dateDisabler(new Date(1901, 0, 1).toISOString(), "less")(current)
    || (deathDate != null ? dateDisabler(new Date(deathDate).toISOString(), "greater")(current) : undefined)
    || dateDisabler(new Date().toISOString(), "greaterOrEqual")(current)
}

export function disableAdultBirthdayDateWithDeathDate(deathDate: string): (current: Moment) => boolean {
  return (current: Moment): boolean => dateDisabler(new Date(1901, 0, 1).toISOString(), "less")(current)
    || (deathDate != null ? dateDisabler(new Date(deathDate).toISOString(), "greater")(current) : undefined)
    || getAge(current) < 18
    || disableFutureDate(current)
}

export function disableFutureDateAndDateLessThanBirthday(birthday: string): (current: Moment) => boolean {
  return (current: Moment): boolean => disableFutureDate(current)
    || (birthday != null ? dateDisabler(new Date(birthday).toISOString(), "less")(current) : undefined)
}

// Return:
//  -1 if date < (current date - from year);
//  +1 if date > (current date + to year);
//  0 otherwise.
//
export function checkDateInRangeOfYearsFromNow(from: number, to: number, date: Moment): number {
  const now = moment().endOf('day');
  const fromDate = moment(now).add(from, "years").startOf("day");
  const toDate = now.add(to, "years").endOf("day");
  if (date < fromDate) {
    return -1;
  }
  if (date > toDate) {
    return 1;
  }

  return 0;
}

export function disableDateNotBetweenYearsFromNow(from: number, to: number): (current: Moment) => boolean {
  return (current: Moment): boolean => checkDateInRangeOfYearsFromNow(from, to, current) !== 0
}

export function disableFutureDateAndPassportIssueDateByAge(birthday: string, age: number, current: Moment): boolean {
  const disableDateByAge = (): boolean => {
    if (moment(birthday).add(45, 'years').add(30, "days") <= current) {
      return dateDisabler(moment(birthday).add(45, 'years').toISOString(), "less")(current);
    } else if(moment(birthday).add(20, 'years').add(30, "days") <= current) {
      return dateDisabler(moment(birthday).add(20, 'years').toISOString(), "less")(current);
    } else if (moment(birthday).add(14, 'years') <= current) {
      return dateDisabler(moment(birthday).add(14, "years").toISOString(), "less")(current)
    } else {
      return true;
    }
  };
  return disableFutureDate(current) || disableDateByAge();
}

export function disableFutureDateAndIssueDateGreaterThanAge(docCode: number, birthday: string, age: number, current: Moment): boolean {
  const targetAge = docCode === 14 ? 14 : 18;
  const disableDateByAge = age >= targetAge
    ? dateDisabler( moment(birthday).add(targetAge, "years").toISOString(), "less")(current)
    : true;

  return disableFutureDate(current) || disableDateByAge;
}

export function disableDocDate(docCode: number, birthday: string, age: number, current: Moment): boolean {
  return docCode === 21 // passport
    ? disableFutureDateAndPassportIssueDateByAge(birthday, age, current)
    : [14, 7, 8].includes(docCode) // 14 - temporary identity card, 7 - military ID, 8 - temporary military ID
      ? disableFutureDateAndIssueDateGreaterThanAge(docCode, birthday, age, current) // temporary identity card - 14 years age, other 18
      : disableFutureDateAndDateLessThanBirthday(birthday)(current);
}
