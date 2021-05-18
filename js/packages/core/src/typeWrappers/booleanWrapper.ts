/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types */

/**
 * If type of value is number - return value.
 * Otherwise return default value
 */
export function defaultIfNotBoolean(value: any, defaultValue: boolean): boolean {
  return typeof value === "boolean" ? value : defaultValue;
}

/**
 * If type of value is number - return value.
 * Otherwise return default value
 */
export function defaultIfNotBooleanFn(defaultValue: boolean): (value: any) => boolean {
  return (value: any): boolean => defaultIfNotBoolean(value, defaultValue);
}
