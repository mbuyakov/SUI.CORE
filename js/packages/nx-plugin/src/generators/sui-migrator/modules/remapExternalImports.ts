import {factory, ImportDeclaration, StringLiteral} from "typescript";
import {mapModules} from "../../../utils/consts";
import {logWithPrefix} from "../../../utils/logger";
// eslint-disable-next-line @nx/enforce-module-boundaries
import {astReplace, printNode} from "@sui/lib-typescript-ast";

export function remapExternalImports(projectName: string, content: string): string {

  return astReplace(content, "ImportDeclaration:has(ImportClause)", (node: ImportDeclaration) => {
    const moduleName = (node.moduleSpecifier as StringLiteral).text;
    const newName = Object.entries(mapModules)
      .find(([oldName]) => moduleName == oldName || moduleName.startsWith(oldName + "/"))
      ?.[1];

    if (
      !newName
      // Don't replace yourself
      || newName === projectName
    ) {
      return;
    }

    logWithPrefix("remapExternalImports", `Replace ${moduleName} to ${newName}`);

    let namedImports = node.importClause.namedBindings;

    // If used default import - probably it's from submodule, replace with named import
    if (!namedImports) {
      namedImports = factory.createNamedImports([
        factory.createImportSpecifier(node.importClause.isTypeOnly, undefined, node.importClause.name)
      ]);
    }
    return printNode(
      factory.updateImportDeclaration(
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
      )
    );
  });
}
