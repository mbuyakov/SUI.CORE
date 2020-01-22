import InputMask from "antd-mask-input/build/main/lib/inputmask-core";
import moment, {Moment} from "moment";

import {NO_DATA_TEXT} from "../const";

export function dateDisabler(bound: string, type: "greater" | "greaterOrEqual" | "less" | "lessOrEqual"): (current: Moment) => boolean {
  return (current: Moment): boolean => {
    const boundMoment = moment(bound);

    // tslint:disable-next-line:switch-default
    switch (type) {
      case "greater":
        return boundMoment.endOf("day") < current;
      case "greaterOrEqual":
        return boundMoment.startOf("day") <= current;
      case "less":
        return boundMoment.startOf("day") > current;
      case "lessOrEqual":
        return boundMoment.endOf("day") >= current;
    }

    return false;
  }
}

export function disableFutureDate(current: Moment): boolean {
  return current > moment().endOf('day');
}

export function disableBirthdayDateWithDeathDate(deathDate: string): (current: Moment) => boolean {
  return (current: Moment): boolean => dateDisabler(new Date(1901, 0, 1).toISOString(), "less")(current)
    || (deathDate !== null ? dateDisabler(new Date(deathDate).toISOString(), "greater")(current) : undefined)
    || dateDisabler(new Date().toISOString(), "greaterOrEqual")(current)
}

export function disableDateNotBetweenYearsFromNow(from: number, to: number): (current: Moment) => boolean {
  return (current: Moment): boolean => {
    const now = moment().endOf('day');
    const fromDate = moment(now).add(from, "years").startOf("day");
    const toDate = now.add(to, "years").endOf("day");

    return current < fromDate || current > toDate;
  }
}

export function formatByMaskFn(pattern: string): (value: string | null | undefined) => string {
  return (value: string | null | undefined): string => {
    if (!value) {
      return NO_DATA_TEXT;
    }

    return new InputMask({
      pattern,
      value
    }).getValue();
  }
}
