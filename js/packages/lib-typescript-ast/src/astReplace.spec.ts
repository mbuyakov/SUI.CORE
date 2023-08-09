import {astReplace} from "./astReplace";
import {NumericLiteral} from "typescript";

describe("ast replace", () => {
  it("replace NumericLiteral to 2", () => {
    expect(astReplace(
      "const a = 1;",
      "NumericLiteral",
      () => "2"
    )).toBe("const a = 2;");
  });

  it("replace NumericLiteral to 2 if source is 1", () => {
    expect(astReplace(
      "const a = 1;const b = 3;",
      "NumericLiteral",
      (node) => {
        if ((node as NumericLiteral).text == "1") {
          return "2";
        }
        return null;
      })).toBe("const a = 2;const b = 3;");
  });
});
