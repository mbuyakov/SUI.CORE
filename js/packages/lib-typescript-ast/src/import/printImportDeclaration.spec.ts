import {ParsedImportDeclaration} from "./ParsedImportDeclaration";
import {printImportDeclaration} from "./printImportDeclaration";
import {printNode} from "../printNode";

describe("print import declaration", () => {
  it("should print import without an naming", () => {
    const code = "import \"a\";";
    const parsedImport: ParsedImportDeclaration = {
      from: "a",
      namedImports: []
    };
    expect(printNode(printImportDeclaration(parsedImport))).toBe(code);
  });

  it("should print import with naming", () => {
    const code = "import b from \"a\";";
    const parsedImport: ParsedImportDeclaration = {
      from: "a",
      namedImports: [],
      import: "b"
    };
    expect(printNode(printImportDeclaration(parsedImport))).toBe(code);
  });

  it("should print import with namespace", () => {
    const code = "import * as b from \"a\";";
    const parsedImport: ParsedImportDeclaration = {
      from: "a",
      namedImports: [],
      nsImport: "b"
    };
    expect(printNode(printImportDeclaration(parsedImport))).toBe(code);
  });

  it("should print import with named imports", () => {
    const code = "import {b} from \"a\";";
    const parsedImport: ParsedImportDeclaration = {
      from: "a",
      namedImports: [{originalName: "b"}],
    };
    expect(printNode(printImportDeclaration(parsedImport))).toBe(code);
  });

  it("should print import with aliased named imports", () => {
    const code = "import {b as c} from \"a\";";
    const parsedImport: ParsedImportDeclaration = {
      from: "a",
      namedImports: [{originalName: "b", alias: "c"}],
    };
    expect(printNode(printImportDeclaration(parsedImport))).toBe(code);
  });
});
