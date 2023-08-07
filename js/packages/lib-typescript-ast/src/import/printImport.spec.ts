import {ParsedImport} from "./ParsedImport";
import {printImport} from "./printImport";
import {printNode} from "../printNode";

describe("print import", () => {
  it("should print import without an naming", () => {
    const code = "import \"a\";";
    const parsedImport: ParsedImport = {
      from: "a",
      namedImports: []
    };
    expect(printNode(printImport(parsedImport))).toBe(code);
  });

  it("should print import with naming", () => {
    const code = "import b from \"a\";";
    const parsedImport: ParsedImport = {
      from: "a",
      namedImports: [],
      import: "b"
    };
    expect(printNode(printImport(parsedImport))).toBe(code);
  });

  it("should print import with namespace", () => {
    const code = "import * as b from \"a\";";
    const parsedImport: ParsedImport = {
      from: "a",
      namedImports: [],
      nsImport: "b"
    };
    expect(printNode(printImport(parsedImport))).toBe(code);
  });

  it("should print import with named imports", () => {
    const code = "import {b} from \"a\";";
    const parsedImport: ParsedImport = {
      from: "a",
      namedImports: [{originalName: "b"}],
    };
    expect(printNode(printImport(parsedImport))).toBe(code);
  });

  it("should print import with aliased named imports", () => {
    const code = "import {b as c} from \"a\";";
    const parsedImport: ParsedImport = {
      from: "a",
      namedImports: [{originalName: "b", alias: "c"}],
    };
    expect(printNode(printImport(parsedImport))).toBe(code);
  });
});
