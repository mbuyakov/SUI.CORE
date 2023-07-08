import {tsquery} from "@phenomnomnominal/tsquery";
import {factory, ImportDeclaration, StringLiteral} from "typescript";
import {mapModules, printNode} from "./util";
import {logSymbols, logWithPrefix} from "../../utils/logger";

export function remapImports(projectName: string, content: string): string {

  return tsquery.replace(content, "ImportDeclaration", (node: ImportDeclaration) => {
    const moduleName = (node.moduleSpecifier as StringLiteral).text;
    let newName: string;

    for (const oldName of Object.keys(mapModules)) {
      if (
        mapModules[oldName] != `@sui/${projectName}` // Don't replace yourself
        && (moduleName == oldName || moduleName.startsWith(oldName + "/")) // If import contain out managed modules
        ) {
        newName = mapModules[oldName];
      }
    }

    if (!newName) {
      return;
    }

    logWithPrefix("remapImports", `Replace ${moduleName} to ${newName}`);

    // If used import default - probably it's from submodule, replace with named import
    const namedImports = node.importClause.namedBindings || factory.createNamedImports([
      factory.createImportSpecifier(node.importClause.isTypeOnly, undefined, node.importClause.name)
    ]);

    node = factory.updateImportDeclaration(
      node,
      node.modifiers,
      factory.updateImportClause(
        node.importClause,
        node.importClause.isTypeOnly,
        undefined,
        namedImports
      ),
      factory.createStringLiteral(newName),
      node.assertClause
    );

    return printNode(node)
      .replace(/{ /g, "{")
      .replace(/ }/g, "}");
  });
}
