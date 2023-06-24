import {Color} from "./Color";

test("From hex without alpha", () => {
  const colorFromHex = Color.fromHex("#FF00FF");
  expect(colorFromHex.r).toBe(255);
  expect(colorFromHex.g).toBe(0);
  expect(colorFromHex.b).toBe(255);
  expect(colorFromHex.a).toBe(1);
});

test("From hex with alpha", () => {
  const colorFromHex = Color.fromHex("#FF00FF80");
  expect(colorFromHex.r).toBe(255);
  expect(colorFromHex.g).toBe(0);
  expect(colorFromHex.b).toBe(255);
  expect(colorFromHex.a.toFixed(2)).toBe("0.50");
});

test("From hex without alpha to rgba", () => {
  expect(Color.fromHex("#FF00FF").toRgba()).toBe("rgba(255,0,255,1)");
});

test("From hex with alpha to rgba", () => {
  expect(Color.fromHex("#FF00FF80").toRgba()).toBe("rgba(255,0,255,0.50)");
});
