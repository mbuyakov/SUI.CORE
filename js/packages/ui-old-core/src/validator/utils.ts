import moment, {Moment} from "moment";

/**
 * Disable all dates with chosen strategy
 * @deprecated Use specific dateDisablers
 * @see greaterDateDisabler
 * @see greaterOrEqualDateDisabler
 * @see lessDateDisabler
 * @see lessOrEqualDateDisabler
 */
export function dateDisabler(bound: string | Moment, strategy: "greater" | "greaterOrEqual" | "less" | "lessOrEqual"): (target: Moment) => boolean {
  const boundMoment = typeof (bound) === "string" ? moment(bound) : bound;

  switch (strategy) {
    case "greater":
      return greaterDateDisabler(boundMoment);
    case "greaterOrEqual":
      return greaterOrEqualDateDisabler(boundMoment);
    case "less":
      return lessDateDisabler(boundMoment);
    case "lessOrEqual":
      return lessOrEqualDateDisabler(boundMoment);
    default:
      return (): boolean => false;
  }
}

/**
 * Disable all dates that are greater than the bound
 */
export function greaterDateDisabler(bound: Moment): (target: Moment) => boolean {
  return (target): boolean => target.isAfter(bound, "day");
}

/**
 * Disable all dates that are greater or equal than the bound
 */
export function greaterOrEqualDateDisabler(bound: Moment): (target: Moment) => boolean {
  return (target): boolean => target.isSameOrAfter(bound, "day");
}

/**
 * Disable all dates that are less than the bound
 */
export function lessDateDisabler(bound: Moment): (target: Moment) => boolean {
  return (target): boolean => target.isBefore(bound, "day");
}

/**
 * Disable all dates that are less or equal than the bound
 */
export function lessOrEqualDateDisabler(bound: Moment): (target: Moment) => boolean {
  return (target): boolean => target.isSameOrBefore(bound, "day");
}
