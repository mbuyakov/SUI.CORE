/* tslint:disable:completed-docs */
import * as other from "./";

test("Sleep 5ms async", async () => {
  await other.sleep(5);
});

test("Group by name", () => {
  const data = [
    {name: "name1", value: "value1"},
    {name: "name2", value: "value2"},
    {name: "name1", value: "value3"},
    {name: "name2", value: "value4"},
    {name: "name1", value: "value5"},
    {name: "name3", value: "value6"}
  ];

  expect(JSON.stringify([...other.groupBy(data, element => element.name)])).toEqual(JSON.stringify(
    [...new Map([
      ['name1', [{name: "name1", value: "value1"}, {name: "name1", value: "value3"}, {name: "name1", value: "value5"}]],
      ['name2', [{name: "name2", value: "value2"}, {name: "name2", value: "value4"},]],
      ['name3', [{name: "name3", value: "value6"}]]
    ])]
  ));
});

test("Group sum", () => {
  const data = [
    {name: "name1", value: 1},
    {name: "name2", value: 3},
    {name: "name1", value: 4},
    {name: "name2", value: 5},
    {name: "name1", value: 6},
    {name: "name3", value: 7}
  ];

  expect(JSON.stringify([...other.groupBy<string, { name: string, value: number }, number>(data, element => element.name, (element, lastValue) => element.value + (lastValue || 0))]))
    .toEqual(JSON.stringify([...new Map([
      ['name1', 11],
      ['name2', 8],
      ['name3', 7]
    ])]));
});

test("toMap", () => {
  const data = [
    {name: "name1", value: 1},
    {name: "name2", value: 2},
    {name: "name3", value: 3},
    {name: "name4", value: 4},
    {name: "name5", value: 5},
    {name: "name6", value: 6}
  ];

  expect(JSON.stringify([...other.toMap(data, v => v.name)]))
    .toEqual(JSON.stringify([...new Map([
      ['name1', {name: "name1", value: 1}],
      ['name2', {name: "name2", value: 2}],
      ['name3', {name: "name3", value: 3}],
      ['name4', {name: "name4", value: 4}],
      ['name5', {name: "name5", value: 5}],
      ['name6', {name: "name6", value: 6}]
    ])]));
});

test("toMap with valueExtractor", () => {
  const data = [
    {name: "name1", value: 1},
    {name: "name2", value: 2},
    {name: "name3", value: 3},
    {name: "name4", value: 4},
    {name: "name5", value: 5},
    {name: "name6", value: 6}
  ];

  expect(JSON.stringify([...other.toMap(data, v => v.name, v => v.value)]))
    .toEqual(JSON.stringify([...new Map([
      ['name1', 1],
      ['name2', 2],
      ['name3', 3],
      ['name4', 4],
      ['name5', 5],
      ['name6', 6]
    ])]));
});


test("findByValue with existing value", () => {
  const data = [
    {name: "name1", value: 1},
    {name: "name2", value: 2},
    {name: "name3", value: 3},
    {name: "name4", value: 4},
    {name: "name5", value: 5},
    {name: "name6", value: 6}
  ];

  expect(JSON.stringify(other.findByValue(data, element => element.value, 4)))
    .toEqual(JSON.stringify({name: "name4", value: 4}));
});

test("findByValue with non-existing value", () => {
  const data = [
    {name: "name1", value: 1},
    {name: "name2", value: 2},
    {name: "name3", value: 3},
    {name: "name4", value: 4},
    {name: "name5", value: 5},
    {name: "name6", value: 6}
  ];

  expect(other.findByValue(data, element => element.value, 7)).toBeUndefined();
});

test("distinctValues with string[]", () => {
  expect(JSON.stringify(other.distinctValues({array: ["1", "2", "2", "1", null, "1", "3", null, "1", "4"]})))
    .toEqual(JSON.stringify(["1", "2", "3", "4"]))
});

test("distinctValues with string[] and includeNulls", () => {
  expect(JSON.stringify(other.distinctValues({
    array: ["1", "2", "2", "1", null, "1", "3", null, "1", "4"],
    includeNulls: true
  }))).toEqual(JSON.stringify(["1", "2", null, "3", "4"]))
});

test("distinctValues with object[] and mapper", () => {
  expect(JSON.stringify(
    other.distinctValues({
      array: [
        {
          value: "1"
        },
        {
          value: "2"
        },
        {
          value: "1"
        }
      ],
      mapper: obj => obj.value
    }))).toEqual(JSON.stringify(["1", "2"]))
});

test("distinctValues with object[] and equals", () => {
  expect(JSON.stringify(
    other.distinctValues({
      array: [
        {
          value: "1"
        },
        {
          value: "2"
        },
        {
          value: "1"
        }
      ],
      equals: (obj1, obj2) => obj1.value === obj2.value
    })
  )).toEqual(JSON.stringify([
    {
      value: "1"
    },
    {
      value: "2"
    }
  ]))
});
