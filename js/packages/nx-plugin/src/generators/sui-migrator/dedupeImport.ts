import {tsquery} from "./tsqeury";
import {factory, Identifier, ImportDeclaration, ImportSpecifier, NamedImports, StringLiteral} from "typescript";
import {logRemap, printNode} from "./util";

type ImportData = {
  count: number,
  importSpecifiers: ImportSpecifier[],
  defaultImport?: Identifier
};

export function dedupeImport(content: string): string {
  const imports = tsquery.query<ImportDeclaration>(content, "ImportDeclaration");

  const importMap: { [index: string]: ImportData } = {};

  imports.forEach(importDeclaration => {
    const moduleName = (importDeclaration.moduleSpecifier as StringLiteral).text;
    const mapEntry: ImportData = (importMap[moduleName] = importMap[moduleName] || {count: 0, importSpecifiers: []});
    mapEntry.count++;
    mapEntry.defaultImport = importDeclaration.importClause.name || mapEntry.defaultImport;
    mapEntry.importSpecifiers.push(...(importDeclaration.importClause.namedBindings as NamedImports).elements);
  });

  Object.keys(importMap).forEach(moduleName => {
    if (importMap[moduleName].count > 1) {
      logRemap("dedupeImport", `Dedupe import from ${moduleName}`);
      const mapEntry = importMap[moduleName];

      // Leave only first import
      let isFirst = true;
      content = tsquery.remove(content, `ImportDeclaration:has(StringLiteral[value="${moduleName}"])`, () => {
        if (isFirst) {
          isFirst = false;
          return false;
        } else {
          return true;
        }
      }, true);

      content = tsquery.replace(content, `ImportDeclaration:has(StringLiteral[value="${moduleName}"])`, (node: ImportDeclaration) => {
        node = factory.updateImportDeclaration(
          node,
          undefined,
          factory.updateImportClause(
            node.importClause,
            node.importClause.isTypeOnly,
            mapEntry.defaultImport,
            factory.createNamedImports(mapEntry.importSpecifiers)
          ),
          node.moduleSpecifier,
          node.assertClause
        );

        return printNode(node)
          .replace("{ ", "{")
          .replace(" }", "}");
      });
    }
  });

  return content;
}
