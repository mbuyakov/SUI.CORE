import {astQuery} from "../astQuery";
import {parseImportDeclaration} from "./parseImportDeclaration";
import {ImportDeclaration} from "typescript";
import {ParsedImportDeclaration} from "./ParsedImportDeclaration";

describe("parse import declaration", () => {
  it("should parse import without an naming", () => {
    const code = "import \"a\";";
    const parsedImport: ParsedImportDeclaration = {
      from: "a",
      namedImports:[]
    };
    expect(parseImportDeclaration(astQuery<ImportDeclaration>(code, "ImportDeclaration")[0])).toStrictEqual(parsedImport);
  });

  it("should parse import with naming", () => {
    const code = "import b from \"a\";";
    const parsedImport: ParsedImportDeclaration = {
      from: "a",
      namedImports:[],
      import: "b"
    };
    expect(parseImportDeclaration(astQuery<ImportDeclaration>(code, "ImportDeclaration")[0])).toStrictEqual(parsedImport);
  });

  it("should parse import with namespace", () => {
    const code = "import * as b from \"a\";";
    const parsedImport: ParsedImportDeclaration = {
      from: "a",
      namedImports:[],
      nsImport: "b"
    };
    expect(parseImportDeclaration(astQuery<ImportDeclaration>(code, "ImportDeclaration")[0])).toStrictEqual(parsedImport);
  });

  it("should parse import with named imports", () => {
    const code = "import {b} from \"a\";";
    const parsedImport: ParsedImportDeclaration = {
      from: "a",
      namedImports:[{originalName: "b"}],
    };
    expect(parseImportDeclaration(astQuery<ImportDeclaration>(code, "ImportDeclaration")[0])).toStrictEqual(parsedImport);
  });

  it("should parse import with aliased named imports", () => {
    const code = "import {b as c} from \"a\";";
    const parsedImport: ParsedImportDeclaration = {
      from: "a",
      namedImports:[{originalName: "b", alias: "c"}],
    };
    expect(parseImportDeclaration(astQuery<ImportDeclaration>(code, "ImportDeclaration")[0])).toStrictEqual(parsedImport);
  });
});
