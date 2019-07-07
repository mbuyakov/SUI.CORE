import * as arrayWrapper from "./arrayWrapper";

test("Wrap in array one element", () => {
  expect(arrayWrapper.wrapInArray(1)).toEqual([1]);
  expect(arrayWrapper.wrapInArrayFn()(1)).toEqual([1]);
});

test("Wrap in array array of element", () => {
  expect(arrayWrapper.wrapInArray([1])).toEqual([1]);
  expect(arrayWrapper.wrapInArrayFn()([1])).toEqual([1]);
});


test("Wrap in array without nulls one element", () => {
  expect(arrayWrapper.wrapInArrayWithoutNulls(1)).toEqual([1]);
  expect(arrayWrapper.wrapInArrayWithoutNullsFn()(1)).toEqual([1]);
});

test("Wrap in array without nulls array of element", () => {
  expect(arrayWrapper.wrapInArrayWithoutNulls([1, null])).toEqual([1]);
  expect(arrayWrapper.wrapInArrayWithoutNullsFn()([1, null])).toEqual([1]);
});
