import moment, {Moment} from "moment";

export function dateDisabler(bound: string| Moment, type: "greater" | "greaterOrEqual" | "less" | "lessOrEqual"): (target: Moment) => boolean {
  return (target: Moment): boolean => {
    const boundMoment = moment(bound);

    switch (type) {
      case "greater":
        return boundMoment.endOf("day") < target;
      case "greaterOrEqual":
        return boundMoment.startOf("day") <= target;
      case "less":
        return boundMoment.startOf("day") > target;
      case "lessOrEqual":
        return boundMoment.endOf("day") >= target;
    }

    return false;
  }
}

