import {lazyInit} from "./lazyInit";

test("Lazy init persistance check", () => {
  const lazy = lazyInit(() => Math.random());
  expect(lazy()).toBe(lazy());
})
