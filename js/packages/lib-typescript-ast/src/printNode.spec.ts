import {printNode, printNodes} from "./printNode";
import {factory, NodeFlags} from "typescript";

describe("print node", () => {
  it("should print single node", () => {
    expect(printNode(factory.createVariableStatement(
      undefined,
      factory.createVariableDeclarationList(
        [factory.createVariableDeclaration(
          factory.createIdentifier("a"),
          undefined,
          undefined,
          factory.createNumericLiteral("1")
        )],
        NodeFlags.Const
      )
    ))).toBe("const a = 1;");
  });

  it("should print multiple node", () => {
    expect(printNodes([
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [factory.createVariableDeclaration(
            factory.createIdentifier("a"),
            undefined,
            undefined,
            factory.createNumericLiteral("1")
          )],
          NodeFlags.Const
        )
      ),
      factory.createVariableStatement(
        undefined,
        factory.createVariableDeclarationList(
          [factory.createVariableDeclaration(
            factory.createIdentifier("b"),
            undefined,
            undefined,
            factory.createNumericLiteral("2")
          )],
          NodeFlags.Const
        )
      )
    ])).toBe("const a = 1;\nconst b = 2;");
  });
});
