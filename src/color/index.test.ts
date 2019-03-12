/* tslint:disable:no-import-side-effect no-implicit-dependencies typedef */
import * as chai from "chai";
import "mocha";

import * as color from "./index";

describe("Color", () => {
  it("From hex without alpha", () => {
    const colorFromHex = color.Color.fromHex("#FF00FF");
    chai.assert.equal(colorFromHex.r, 255);
    chai.assert.equal(colorFromHex.g, 0);
    chai.assert.equal(colorFromHex.b, 255);
    chai.assert.equal(colorFromHex.a, 255);
  });

  it("From hex with alpha", () => {
    const colorFromHex = color.Color.fromHex("#FF00FF80");
    chai.assert.equal(colorFromHex.r, 255);
    chai.assert.equal(colorFromHex.g, 0);
    chai.assert.equal(colorFromHex.b, 255);
    chai.assert.equal(colorFromHex.a, 128);
  });

  it("From hex without alpha to rgba", () => {
    chai.assert.equal(
      color.Color.fromHex("#FF00FF")
        .toRgba(),
      "rgba(255,0,255,255)");
  });

  it("From hex with alpha to rgba", () => {
    chai.assert.equal(
      color.Color.fromHex("#FF00FF80")
        .toRgba(),
      "rgba(255,0,255,128)");
  });

  const black = new color.Color(0, 0, 0, 255);
  const white = new color.Color(255, 255, 255, 255);
  it("Mix Black white 50/50", () => {
    chai.assert.equal(
      color.findColorBetween(black, white)
        .toRgba(),
      "rgba(128,128,128,255)");
  });

  it("Mix Black white 20/80", () => {
    chai.assert.equal(
      color.findColorBetween(black, white, 80)
        .toRgba(),
      "rgba(204,204,204,255)");
  });

  it("Mix Black white 80/20", () => {
    chai.assert.equal(
      color.findColorBetween(black, white, 20)
        .toRgba(),
      "rgba(51,51,51,255)");
  });
});
