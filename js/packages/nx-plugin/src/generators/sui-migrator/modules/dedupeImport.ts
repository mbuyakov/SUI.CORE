import {
  Identifier,
  ImportDeclaration,
  ImportSpecifier,
  isNamespaceImport,
  NamedImports,
  NamespaceImport,
  StringLiteral
} from "typescript";
import {logWithPrefix} from "../../../utils/logger";
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  astQuery,
  astRemove,
  astReplace,
  ParsedImportDeclaration,
  parseImportSpecifier,
  printImportDeclaration,
  printNodes
} from "@sui/lib-typescript-ast";

type ImportData = {
  count: number,
  importSpecifiers: ImportSpecifier[],
  nsImport?: NamespaceImport,
  defaultImport?: Identifier
};

export function dedupeImport(content: string): string {
  const imports = astQuery<ImportDeclaration>(content, "ImportDeclaration:has(ImportClause)");

  const importMap: { [index: string]: ImportData } = {};

  imports.forEach(importDeclaration => {
    const moduleName = (importDeclaration.moduleSpecifier as StringLiteral).text;
    const mapEntry: ImportData = (importMap[moduleName] = importMap[moduleName] || {count: 0, importSpecifiers: []});
    mapEntry.count++;
    mapEntry.defaultImport = importDeclaration?.importClause?.name || mapEntry.defaultImport;
    if (importDeclaration?.importClause?.namedBindings) {
      if (isNamespaceImport(importDeclaration.importClause.namedBindings)) {
        mapEntry.nsImport = importDeclaration.importClause.namedBindings;
      } else {
        mapEntry.importSpecifiers.push(...(importDeclaration.importClause.namedBindings as NamedImports).elements);
      }
    }
  });

  Object.keys(importMap).forEach(moduleName => {
    const mapEntry = importMap[moduleName];
    if (
      importMap[moduleName].count > 2 ||
      // If exactly two import - it might me smth like
      // import * as React from "react"; -- nsImport
      // import {useMemo} from "react";  -- importSpecifiers
      (importMap[moduleName].count == 2 && !(mapEntry.nsImport && (mapEntry.defaultImport || mapEntry.importSpecifiers)))
    ) {
      logWithPrefix("dedupeImport", `Dedupe import from ${moduleName}`);

      const mapEntry = importMap[moduleName];

      // Leave only first import
      let isFirst = true;
      content = astRemove(content, `ImportDeclaration:has(ImportClause):has(StringLiteral[value="${moduleName}"])`, () => {
        if (isFirst) {
          isFirst = false;
          return false;
        } else {
          return true;
        }
      }, true);

      content = astReplace(content, `ImportDeclaration:has(ImportClause):has(StringLiteral[value="${moduleName}"])`, () => {
        const rows: ParsedImportDeclaration[] = [];

        rows.push({
          import: mapEntry.defaultImport?.text,
          namedImports: mapEntry.importSpecifiers.map(it => parseImportSpecifier(it)),
          from: moduleName
        });

        if (mapEntry.nsImport) {
          rows.push({
            nsImport: mapEntry.nsImport.name.text,
            namedImports: [],
            from: moduleName
          });
        }

        return printNodes(rows.map(it => printImportDeclaration(it)));
      });
    }
  });

  return content;
}
