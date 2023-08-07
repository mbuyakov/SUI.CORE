import {astQuery} from "../astQuery";
import {parseImport} from "./parseImport";
import {ImportDeclaration} from "typescript";
import {ParsedImport} from "./ParsedImport";

describe("parse import", () => {
  it("should parse import without an naming", () => {
    const code = "import \"a\";";
    const parsedImport: ParsedImport = {
      from: "a",
      namedImports:[]
    };
    expect(parseImport(astQuery<ImportDeclaration>(code, "ImportDeclaration")[0])).toStrictEqual(parsedImport);
  });

  it("should parse import with naming", () => {
    const code = "import b from \"a\";";
    const parsedImport: ParsedImport = {
      from: "a",
      namedImports:[],
      import: "b"
    };
    expect(parseImport(astQuery<ImportDeclaration>(code, "ImportDeclaration")[0])).toStrictEqual(parsedImport);
  });

  it("should parse import with namespace", () => {
    const code = "import * as b from \"a\";";
    const parsedImport: ParsedImport = {
      from: "a",
      namedImports:[],
      nsImport: "b"
    };
    expect(parseImport(astQuery<ImportDeclaration>(code, "ImportDeclaration")[0])).toStrictEqual(parsedImport);
  });

  it("should parse import with named imports", () => {
    const code = "import {b} from \"a\";";
    const parsedImport: ParsedImport = {
      from: "a",
      namedImports:[{originalName: "b"}],
    };
    expect(parseImport(astQuery<ImportDeclaration>(code, "ImportDeclaration")[0])).toStrictEqual(parsedImport);
  });

  it("should parse import with aliased named imports", () => {
    const code = "import {b as c} from \"a\";";
    const parsedImport: ParsedImport = {
      from: "a",
      namedImports:[{originalName: "b", alias: "c"}],
    };
    expect(parseImport(astQuery<ImportDeclaration>(code, "ImportDeclaration")[0])).toStrictEqual(parsedImport);
  });
});
