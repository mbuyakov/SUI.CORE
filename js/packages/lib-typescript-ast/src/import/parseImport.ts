import {ImportDeclaration, ImportSpecifier, isNamedImports, isNamespaceImport, StringLiteral} from "typescript";
import {ImportWithAlias, ParsedImport} from "./ParsedImport";

export function parseImport(importDeclaration: ImportDeclaration): ParsedImport {
  const ret: ParsedImport = {
    from: (importDeclaration.moduleSpecifier as StringLiteral).text,
    namedImports: [],
  };

  if (importDeclaration.importClause?.name) {
    ret.import = importDeclaration.importClause?.name.text;
  }

  if (importDeclaration.importClause?.namedBindings) {
    if (isNamespaceImport(importDeclaration.importClause.namedBindings)) {
      ret.nsImport = importDeclaration.importClause.namedBindings.name.text;
    } else if (isNamedImports(importDeclaration.importClause.namedBindings)) {
      ret.namedImports = importDeclaration.importClause.namedBindings.elements.map(it => parseImportSpecifier(it));
    }
  }

  return ret;
}

export function parseImportSpecifier(importSpecifier: ImportSpecifier): ImportWithAlias {
  return importSpecifier.propertyName
    ? ({
      originalName: importSpecifier.propertyName.text,
      alias: importSpecifier.name.text
    })
    : ({
      originalName: importSpecifier.name.text
    });
}
