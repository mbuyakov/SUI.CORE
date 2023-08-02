import {factory, Identifier, ImportDeclaration, ImportSpecifier, isNamespaceImport, NamedImports, NamespaceImport, StringLiteral} from "typescript";
import {printNode, tsquery} from "../../../utils/typescript";
import {logWithPrefix} from "../../../utils/logger";

type ImportData = {
  count: number,
  importSpecifiers: ImportSpecifier[],
  nsImport?: NamespaceImport,
  defaultImport?: Identifier
};

export function dedupeImport(content: string): string {
  const imports = tsquery.query<ImportDeclaration>(content, "ImportDeclaration:has(ImportClause)");

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
      content = tsquery.remove(content, `ImportDeclaration:has(ImportClause):has(StringLiteral[value="${moduleName}"])`, () => {
        if (isFirst) {
          isFirst = false;
          return false;
        } else {
          return true;
        }
      }, true);

      content = tsquery.replace(content, `ImportDeclaration:has(ImportClause):has(StringLiteral[value="${moduleName}"])`, () => {
        const rows = [];

        rows.push(
          factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
              false,
              mapEntry.defaultImport,
              mapEntry.importSpecifiers.length ? factory.createNamedImports(mapEntry.importSpecifiers) : undefined
            ),
            factory.createStringLiteral(moduleName)
          )
        );

        if (mapEntry.nsImport) {
          rows.push(
            factory.createImportDeclaration(
              undefined,
              factory.createImportClause(
                false,
                undefined,
                mapEntry.nsImport
              ),
              factory.createStringLiteral(moduleName)
            )
          );
        }

        return rows
          .map(printNode)
          .join("\n");
      });
    }
  });

  return content;
}
