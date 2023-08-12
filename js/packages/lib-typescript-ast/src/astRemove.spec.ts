import {VariableStatement} from "typescript";
import {astRemove} from "./astRemove";

describe("ast remove", () => {
  it("remove all VariableStatement", () => {
    expect(astRemove(
      `
const a = 1;
const b = 2;
if(a) {}
      `.trim(),
      "VariableStatement",
      () => true,
      true
    )).toBe("if(a) {}");
  });

  it("remove all VariableStatement without removeBreakLineAtEnd", () => {
    expect(astRemove(
      `
const a = 1;
const b = 2;
if(a) {}
      `.trim(),
      "VariableStatement",
      () => true,
      false
    )).toBe("\n\nif(a) {}");
  });

  it("remove VariableStatement if value 1", () => {
    expect(astRemove(
      `
const a = 1;
const b = 2;
if(a) {}
      `.trim(),
      "VariableStatement",
      (node) => (node as VariableStatement).declarationList.declarations.at(0)?.initializer?.getText() == "1",
      true
    )).toBe("const b = 2;\nif(a) {}");
  });
});
