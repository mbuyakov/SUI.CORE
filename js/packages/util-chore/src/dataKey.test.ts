import * as dataKey from "./dataKey";

test("NormalizeDataKey", () => {
  expect(dataKey.normalizeDataKey(["1", 2])).toEqual(["1", 2]);
  expect(dataKey.normalizeDataKey(1)).toEqual([1]);
});

test("ConcatDataKey", () => {
  expect(dataKey.concatDataKey("1", 2, [3, 4])).toEqual(["1", 2, 3, 4]);
});

test("GetDataByKey", () => {
  const five = {
    four: {},
    one: false,
    three: "",
    two: 0
  };
  const obj = {
    five,
    four: {},
    one: false,
    three: "",
    two: 0
  };
  expect(dataKey.getDataByKey(obj, "one")).toBe(false);
  expect(dataKey.getDataByKey(obj, "two")).toBe(0);
  expect(dataKey.getDataByKey(obj, "three")).toBe("");
  expect(dataKey.getDataByKey(obj, "four")).toEqual({});
  expect(dataKey.getDataByKey(obj, "five")).toBe(five);
  expect(dataKey.getDataByKey(obj, "one", "one")).toBe(null);
  expect(dataKey.getDataByKey(obj, "two", 1)).toBe(null);
  expect(dataKey.getDataByKey(obj, "three", 0)).toBe(null);
  expect(dataKey.getDataByKey(obj, "four", "1")).toEqual(undefined);
  expect(dataKey.getDataByKey(obj, "five", ["three"])).toBe("");
});

test("DataKeysToDataTree", () => {
  expect(dataKey.dataKeysToDataTree(
    [
      ["one", "two"],
      "three"
    ], "nodes"
  ).toString()).toBe(`nodes {
  one {
  two
}
three
}`);
});


