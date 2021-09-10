import moment, {Moment} from "moment";

/**
 * Disable all dates with chosen strategy
 * @deprecated Use specific dateDisablers
 * @see greaterDateDisabler
 * @see greaterOrEqualDateDisabler
 * @see lessDateDisabler
 * @see lessOrEqualDateDisabler
 */
export function dateDisabler(bound: string | Moment, strategy: "greater" | "greaterOrEqual" | "less" | "lessOrEqual"): (current: Moment) => boolean {
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
export function greaterDateDisabler(bound: Moment): (current: Moment) => boolean {
  return (current): boolean => current.isAfter(bound, "day");
}

/**
 * Disable all dates that are greater or equal than the bound
 */
export function greaterOrEqualDateDisabler(bound: Moment): (current: Moment) => boolean {
  return (current): boolean => current.isSameOrAfter(bound, "day");
}

/**
 * Disable all dates that are less than the bound
 */
export function lessDateDisabler(bound: Moment): (current: Moment) => boolean {
  return (current): boolean => current.isBefore(bound, "day");
}

/**
 * Disable all dates that are less or equal than the bound
 */
export function lessOrEqualDateDisabler(bound: Moment): (current: Moment) => boolean {
  return (current): boolean => current.isSameOrBefore(bound, "day");
}
