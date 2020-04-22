
/**
 * If type of value is number - return value.
 * Otherwise return default value
 */
export function defaultIfNotNumber(value: any, defaultValue: number): number {
  return typeof value === "number" ? value : defaultValue;
}

/**
 * If type of value is number - return value.
 * Otherwise return default value
 */
export function defaultIfNotNumberFn(defaultValue: number): (value: any) => number {
  return (value: any): number => defaultIfNotNumber(value, defaultValue);
}

/**
 * If value is finite number - fix to fractionDigits.
 * Otherwise return value.toString()
 */
export function fixIfPossible(value: any, fractionDigits: number = 2): string {
  try {
    if (typeof value !== "number") {
      value = Number(value);
    }
    if (Number.isFinite(value)) {
      return value.toFixed(fractionDigits);
    }
  } catch (e) {
    // Ignore
  }

  return value.toString();
}

/**
 * If value is number - fix to fractionDigits.
 * Otherwise return empty string
 */
export function fixIfPossibleFn(fractionDigits: number = 2): (value: any) => string {
  return (value: any): string => fixIfPossible(value, fractionDigits);
}
