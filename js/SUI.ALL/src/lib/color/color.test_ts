import * as color from "./color";

test("From hex without alpha", () => {
  const colorFromHex = color.Color.fromHex("#FF00FF");
  expect(colorFromHex.r).toBe(255);
  expect(colorFromHex.g).toBe(0);
  expect(colorFromHex.b).toBe(255);
  expect(colorFromHex.a).toBe(1);
});

test("From hex with alpha", () => {
  const colorFromHex = color.Color.fromHex("#FF00FF80");
  expect(colorFromHex.r).toBe(255);
  expect(colorFromHex.g).toBe(0);
  expect(colorFromHex.b).toBe(255);
  expect(colorFromHex.a.toFixed(2)).toBe("0.50");
});

test("From hex without alpha to rgba", () => {
  expect(color.Color.fromHex("#FF00FF").toRgba()).toBe("rgba(255,0,255,1)");
});

test("From hex with alpha to rgba", () => {
  expect(color.Color.fromHex("#FF00FF80").toRgba()).toBe("rgba(255,0,255,0.50)");
});

const black = new color.Color(0, 0, 0, 1);
const white = new color.Color(255, 255, 255, 1);
test("Mix Black white 50/50", () => {
  expect(color.findColorBetween(black, white).toRgba()).toBe("rgba(128,128,128,1)");
});

test("Mix Black white 20/80", () => {
  expect(color.findColorBetween(black, white, 80).toRgba()).toBe("rgba(204,204,204,1)");
});

test("Mix Black white 80/20", () => {
  expect(color.findColorBetween(black, white, 20).toRgba()).toBe("rgba(51,51,51,1)");
});
