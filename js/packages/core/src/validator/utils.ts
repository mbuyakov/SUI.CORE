import moment, {Moment} from "moment";

export function dateDisabler(bound: string, type: "greater" | "greaterOrEqual" | "less" | "lessOrEqual"): (current: Moment) => boolean {
  return (current: Moment): boolean => {
    const boundMoment = moment(bound);

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

