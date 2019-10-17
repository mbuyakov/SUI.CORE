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

test("[date] Compare null null", () => {
  expect(comparators.formattedDateComparator(null, null)).toBe(0);
  expect(comparators.formattedDateComparator(null, null, false)).toBe(0);
});

test('[date] Compare "" null', () => {
  expect(comparators.formattedDateComparator("", null)).toBe(0);
  expect(comparators.formattedDateComparator("", null, false)).toBe(0);
});

test('[date] Compare "01.11.2019" null', () => {
  expect(comparators.formattedDateComparator("01.11.2019", null)).toBe(-1);
  expect(comparators.formattedDateComparator("01.11.2019", null, false)).toBe(1572566400000);
});

test('[date] Compare "01.11.2019" "02.10.2019"', () => {
  expect(comparators.formattedDateComparator("01.11.2019", "02.10.2019")).toBe(2592000000);
  expect(comparators.formattedDateComparator("01.11.2019", "02.10.2019", false)).toBe(2592000000);
});
