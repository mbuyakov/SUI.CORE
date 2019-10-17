/* tslint:disable:no-any */

import * as booleanWrapper from "./booleanWrapper";

test("Default if not number with not boolean", () => {
  expect(booleanWrapper.defaultIfNotBoolean("1", false)).toBe(false);
  expect(booleanWrapper.defaultIfNotBooleanFn(false)("1")).toBe(false);
});

test("Default if not boolean with boolean", () => {
  expect(booleanWrapper.defaultIfNotBoolean(true, false)).toBe(true);
  expect(booleanWrapper.defaultIfNotBooleanFn(false)(true)).toBe(true);
});
