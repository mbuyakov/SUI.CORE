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
