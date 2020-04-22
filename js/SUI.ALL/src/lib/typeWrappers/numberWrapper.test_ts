import * as numberWrapper from "./numberWrapper";

test("Default if not number with not number", () => {
  expect(numberWrapper.defaultIfNotNumber("1", 10)).toBe(10);
  expect(numberWrapper.defaultIfNotNumberFn(10)("1")).toBe(10);
});

test("Default if not number with number", () => {
  expect(numberWrapper.defaultIfNotNumber(1, 10)).toBe(1);
  expect(numberWrapper.defaultIfNotNumberFn(10)(1)).toBe(1);
});

test('Fix if possible with "NaN"', () => {
  expect(numberWrapper.fixIfPossible("NaN", 10)).toBe("NaN");
  expect(numberWrapper.fixIfPossibleFn(10)("NaN")).toBe("NaN");
});

test('Fix if possible with "-Infinity"', () => {
  expect(numberWrapper.fixIfPossible("-Infinity", 10)).toBe("-Infinity");
  expect(numberWrapper.fixIfPossibleFn(10)("-Infinity")).toBe("-Infinity");
});

test('Fix if possible with "123"', () => {
  expect(numberWrapper.fixIfPossible("123", 10)).toBe("123.0000000000");
  expect(numberWrapper.fixIfPossibleFn(10)("123")).toBe("123.0000000000");
});

test("Fix if possible with 321", () => {
  expect(numberWrapper.fixIfPossible(321, 10)).toBe("321.0000000000");
  expect(numberWrapper.fixIfPossibleFn(10)(321)).toBe("321.0000000000");
});
