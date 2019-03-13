/* tslint:disable:typedef no-null-keyword */

import * as comparators from "./index";

test("[number] Compare null null", () => {
  expect(comparators.numberComparator(null, null)).toBe(0);
});

test('[number] Compare "" null', () => {
  expect(comparators.numberComparator("", null)).toBe(0);
});

test('[number] Compare "1" null', () => {
  expect(comparators.numberComparator("1", null)).toBe(1);
});

test('[number] Compare "2.23" 3', () => {
  expect(comparators.numberComparator("2.23", 3)).toBe(-0.77);
});
